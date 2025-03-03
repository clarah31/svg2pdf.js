import { Context } from '../context/context'
import { MaskPath } from '../nodes/mask'
import { SvgNode } from '../nodes/svgnode'
import { iriReference } from './constants'

export function getMaskPathNode(
  maskPathAttr: string,
  targetNode: SvgNode,
  context: Context
): MaskPath | undefined {
  const match = iriReference.exec(maskPathAttr)
  if (!match) {
    return undefined
  }
  const maskPathId = match[1]
  const maskNode = context.refsHandler.get(maskPathId)
  return (maskNode as MaskPath) || undefined
}

export async function applyMaskPath(
  targetNode: SvgNode,
  maskPathNode: MaskPath,
  context: Context
): Promise<void> {
  const maskContext = context.clone()

  // const bBox = targetNode.getBoundingBox(context)
  // if (
  //   maskPathNode.element.hasAttribute('maskUnits') &&
  //   maskPathNode.element.getAttribute('maskUnits')!.toLowerCase() === 'objectboundingbox'
  // ) {
  //   maskContext.transform = context.pdf.matrixMult(
  //     context.pdf.Matrix(bBox[2], 0, 0, bBox[3], bBox[0], bBox[1]),
  //     context.transform
  //   )
  // }
  await maskPathNode.apply(maskContext);

  
}
