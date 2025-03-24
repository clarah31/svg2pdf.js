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
    const hideNode = MKITEffects.inEffectNode(parentContext, this.element)
    // AUIT
    // if (0)
    //   if (MKITEffects.inEffectNode(parentContext, this.element)) {
    //     //console.log('inEffectNode...', this.element.id)
    //     const clipPathAttribute = getAttribute(this.element, context.styleSheets, 'clip-path')
    //     let hasClipPath = clipPathAttribute && clipPathAttribute !== 'none'
    //     if (!hasClipPath) {
    //       return
    //       //        await this.renderCore(context)
    //     }
    //   }

    parseAttributes(context, this)

    const maskPathAttribute = getAttribute(this.element, context.styleSheets, 'mask')
    const hasMaskPath = maskPathAttribute && maskPathAttribute !== 'none'
    let maskNode = null
    if (hasMaskPath) {
      maskNode = getMaskPathNode(maskPathAttribute!, this, context)
      if (!maskNode) {
        return
      }
      if (!maskNode.isVisible(true, context)) {
        maskNode = null
      }
      if (hideNode) return
    }

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
    // const maskPathAttribute = getAttribute(this.element, context.styleSheets, 'mask')
    // let hasMaskPath =  !hideNode && maskPathAttribute && maskPathAttribute !== 'none'
    if (maskNode) {
      context.pdf.saveGraphicsState()
      await applyMaskPath(this, maskNode, context)
      
    }

    if (!context.withinClipPath || !context.withinMaskPath) {
      context.pdf.saveGraphicsState()
    }
    if (!hideNode) applyAttributes(context, parentContext, this.element)
   
    await this.renderCore(context)
    if (!context.withinClipPath || !context.withinMaskPath) {
      context.pdf.restoreGraphicsState()
    }

    if (hasClipPath ) {
      context.pdf.restoreGraphicsState()
    }
    if (maskNode) {
      context.pdf.restoreGraphicsState()
    }
  }

  protected abstract renderCore(context: Context): Promise<void>
}
