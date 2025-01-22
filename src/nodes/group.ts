import { Matrix } from 'jspdf'
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
    
   // await super.render(parentContext);
      //@ts-ignore
       if (!this.element.ownerDocument.__MKITjsPdf.getEffectHandler().drawEffectNode(parentContext,this)){
     //   console.log("Render Group stop:",this.element.id)
        const context = parentContext.clone();
        await this.renderCore(context);
        return
       }
    //   console.log("Render Group show:",this.element.id)
          
      await super.render(parentContext);
    }
  protected async renderCore(context: Context): Promise<void> {
      await super.renderCore(context);
      //@ts-ignore
      this.element.ownerDocument.__MKITjsPdf.getEffectHandler().drawGridLayout(context,this)
  }

}
