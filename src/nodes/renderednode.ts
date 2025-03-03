import { MKITEffects } from 'PdfBuilder/jsPDF/MKITEffects'
import { applyAttributes, parseAttributes } from '../applyparseattributes'
import { Context } from '../context/context'
import { applyClipPath, getClipPathNode } from '../utils/applyclippath'
import { applyMaskPath, getMaskPathNode } from '../utils/applymaskpath'
import { getAttribute } from '../utils/node'
import { SvgNode } from './svgnode'

export abstract class RenderedNode extends SvgNode {
  async render(parentContext: Context): Promise<void> {
    //  if (!this.isVisible(parentContext.attributeState.visibility !== 'hidden', parentContext)) {
    // //   return
    //  }
      
    // if (this.element.nodeName !== 'text' && this.element.nodeName !== 'g') {
    //   if (parentContext.inEffectNode) {
    //     console.log('inEffectNode...', this.element.id)
    //     return
    //   }
    // }
    const context = parentContext.clone()
    context.transform = context.pdf.matrixMult(
      this.computeNodeTransform(context),
      parentContext.transform
    )

    // AUIT
    if ( MKITEffects.inEffectNode(parentContext, this.element) ){
      //console.log('inEffectNode...', this.element.id)
      await this.renderCore(context)
      return;
    }

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
    // AUIT mask
    const maskPathAttribute = getAttribute(this.element, context.styleSheets, 'mask')
    let hasMaskPath = maskPathAttribute && maskPathAttribute !== 'none'

    if (hasMaskPath) {
      const maskNode = getMaskPathNode(maskPathAttribute!, this, context)
      if (maskNode) {
        if (maskNode.isVisible(true, context)) {
          context.pdf.saveGraphicsState()
          await applyMaskPath(this, maskNode, context)
        } else {
          return
        }
      } else {
        hasMaskPath = false
      }
    }

    if (!context.withinClipPath || !context.withinMaskPath) {
      context.pdf.saveGraphicsState()
    }
    applyAttributes(context, parentContext, this.element)
    await this.renderCore(context)
    if (!context.withinClipPath || !context.withinMaskPath) {
      context.pdf.restoreGraphicsState()
    }

    if (hasClipPath || hasMaskPath) {
      context.pdf.restoreGraphicsState()
    }
  }

  protected abstract renderCore(context: Context): Promise<void>
}
