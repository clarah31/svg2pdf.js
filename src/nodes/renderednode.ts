import { applyAttributes, parseAttributes } from '../applyparseattributes'
import { Context } from '../context/context'
import { getAttribute } from '../utils/node'
import { SvgNode } from './svgnode'
import { applyClipPath, getClipPathNode } from '../utils/applyclippath'

export abstract class RenderedNode extends SvgNode {
  async render(parentContext: Context): Promise<void> {
    if (!this.isVisible(parentContext.attributeState.visibility !== 'hidden', parentContext)) {
      return
    }
  // MKITJsPDF
    // let p = this.element.parentElement;
    // if ( this.element.nodeName!=='text' && this.element.nodeName!=='g'){
    //   while ( p ){
    //     const hbg=p.getAttribute('hasBGImage');
    //     if ( hbg && hbg === "1"){
    //       return;
    //     }
    //     if ( p.nodeName ==='g' )
    //       break;
    //     p = p.parentElement;
    //   }
  
    // }
    const context = parentContext.clone()
    context.transform = context.pdf.matrixMult(
      this.computeNodeTransform(context),
      parentContext.transform
    )

    parseAttributes(context, this)

    const clipPathAttribute = getAttribute(this.element, context.styleSheets, 'clip-path')
    let hasClipPath = clipPathAttribute && clipPathAttribute !== 'none'

    if (hasClipPath) {
      const clipNode = getClipPathNode(clipPathAttribute!, this, context)
      if (clipNode) {
        if (clipNode.isVisible(true, context)) {
          context.pdf.saveGraphicsState()
          await applyClipPath(this, clipNode, context)
        } else {
          return
        }
      } else {
        hasClipPath = false
      }
    }

    if (!context.withinClipPath) {
      context.pdf.saveGraphicsState()
    }
    applyAttributes(context, parentContext, this.element)
    await this.renderCore(context)
    if (!context.withinClipPath) {
      context.pdf.restoreGraphicsState()
    }

    if (hasClipPath) {
      context.pdf.restoreGraphicsState()
    }
  }

  protected abstract renderCore(context: Context): Promise<void>
}
