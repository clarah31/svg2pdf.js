import { Matrix } from 'jspdf'
import { MKITEffects } from 'PdfBuilder/jsPDF/MKITEffects'
import { Context } from '../context/context'
import { svgNodeAndChildrenVisible } from '../utils/node'
import { ContainerNode } from './containernode'

export class Group extends ContainerNode {
  isVisible(parentVisible: boolean, context: Context): boolean {
    return svgNodeAndChildrenVisible(this, parentVisible, context)
  }

  protected computeNodeTransformCore(context: Context): Matrix {
    return context.pdf.unitMatrix
  }
  async render(parentContext: Context): Promise<void> {
    const useEffect = MKITEffects.drawEffectNode(parentContext, this, false)
    //    console.log("Group:",this.element.id)
//    await super.render(parentContext)
    if (useEffect !== 0) {
       const context = parentContext.clone()
      // context.inEffectNode=useEffect;
       if ( useEffect === 1 ){
        await super.renderCore(context)
      }
      return
    }
    // if ( !MKITEffects.inEffectNode(parentContext, this) )
    // {
    //   parentContext.inEffectNode=0;
    // }
    await super.render(parentContext)
  }
  protected async renderCore(context: Context): Promise<void> {
    //draw alle children
    // MKITEffects.drawEffectNode(context,this,false)
    // const useEffect = MKITEffects.drawEffectNode(context, this, false);
    // if ( !useEffect)
    await super.renderCore(context)
    //AUIT
    MKITEffects.drawGridLayout(context, this)
  }
}
