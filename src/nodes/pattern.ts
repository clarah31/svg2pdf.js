import { Matrix, TilingPattern } from 'jspdf'
import { Context } from '../context/context'
import { defaultBoundingBox } from '../utils/bbox'
import { Rect } from '../utils/geometry'
import { svgNodeAndChildrenVisible } from '../utils/node'
import { NonRenderedNode } from './nonrenderednode'

export class Pattern extends NonRenderedNode {
  async apply(context: Context): Promise<void> {
    const id = this.element.getAttribute('id')
    if (!id) {
      return
    }

    // the transformations directly at the node are written to the pattern transformation matrix
    const bBox = this.getBoundingBox(context)
    const pattern = new TilingPattern(
      [bBox[0], bBox[1], bBox[0] + bBox[2], bBox[1] + bBox[3]],
      bBox[2],
      bBox[3]
    )

    //AUIT patternData
    context.pdf.beginTilingPattern(pattern,context.patternData)
    // continue without transformation

    for (const child of this.children) {
      await child.render(
        new Context(context.pdf, {
          attributeState: context.attributeState,
          refsHandler: context.refsHandler,
          styleSheets: context.styleSheets,
          viewport: context.viewport,
          svg2pdfParameters: context.svg2pdfParameters,
          textMeasure: context.textMeasure,
          patternData:context.patternData
        })
      )
    }
    context.pdf.endTilingPattern(id, pattern)
  }

  protected getBoundingBoxCore(context: Context): Rect {
    return defaultBoundingBox(this.element, context)
  }

  protected computeNodeTransformCore(context: Context): Matrix {
    return context.pdf.unitMatrix
  }

  isVisible(parentVisible: boolean, context: Context): boolean {
    return svgNodeAndChildrenVisible(this, parentVisible, context)
  }
}
