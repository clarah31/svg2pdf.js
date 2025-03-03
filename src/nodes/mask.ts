import { Context } from '../context/context'
import { getBoundingBoxByChildren } from '../utils/bbox'
import { Rect } from '../utils/geometry'
import { getAttribute, svgNodeAndChildrenVisible } from '../utils/node'
import { NonRenderedNode } from './nonrenderednode'

export class MaskPath extends NonRenderedNode {
  async apply(context: Context): Promise<void> {
    const doc: PDFKit.PDFDocument = context.pdf.doc
    if (!this.isVisible(true, context)) {
      return
    }
    const bBox: number[] = this.getBoundingBoxCore(context)
    context.pdf.beginFormObject(bBox[0], bBox[1], bBox[2], bBox[3], null)

    doc.save()
    doc.addContent('1 0 0 1 0 0 cm')
    for (const child of this.children) {
      await child.render(
        new Context(context.pdf, {
          refsHandler: context.refsHandler,
          styleSheets: context.styleSheets,
          viewport: context.viewport,
          withinMaskPath: true,
          svg2pdfParameters: context.svg2pdfParameters,
          textMeasure: context.textMeasure,
          patternData:context.patternData
        })
      )
    }

    const key = context.refsHandler.generateKey(this.element.id, context.attributeState)
    doc.restore()
    context.pdf.endFormObject(key)

    //@ts-ignore
    if (!doc._groupStackMap) doc._groupStackMap = {}
    //@ts-ignore
    const group: PDFGroup = doc._groupStackMap[key]
    if (!group) {
      console.log('No group found')
      return
    }
    const maskType = '' + getAttribute(this.element, context.styleSheets, 'mask-type')
    const map: { [key: string]: string } = { luminance: 'Luminosity', alpha: 'Alpha' }
    const sMask = map[maskType.toLowerCase()] || 'Luminosity'

    const clip = true //Immer
    //@ts-ignore
    let name = 'M' + (doc._maskCount = (doc._maskCount || 0) + 1)
    let gstate = doc.ref({
      Type: 'ExtGState',
       CA: 1,
       ca: 1,
       BM: 'Multiply',
      SMask: {
        S: sMask, //'Luminosity',
        G: group.xobj,
        BC: clip ? [0, 0, 0] : [1, 1, 1],
      },
    })
    //@ts-ignore
    gstate.end()
    doc.page.ext_gstates[name] = gstate
    doc.addContent('/' + name + ' gs')
  }

  protected getBoundingBoxCore(context: Context): Rect {
    return getBoundingBoxByChildren(context, this)
  }

  isVisible(parentVisible: boolean, context: Context): boolean {
    return svgNodeAndChildrenVisible(this, parentVisible, context)
  }
}
