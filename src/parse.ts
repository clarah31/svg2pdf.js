import cssesc from 'cssesc'

import { MKitImageNode } from 'PdfBuilder/jsPDF/ImageNode'
import { Circle } from './nodes/circle'
import { ClipPath } from './nodes/clippath'
import { Ellipse } from './nodes/ellipse'
import { Group } from './nodes/group'
import { Line } from './nodes/line'
import { LinearGradient } from './nodes/lineargradient'
import { MarkerNode } from './nodes/marker'
import { PathNode } from './nodes/path'
import { Pattern } from './nodes/pattern'
import { Polygon } from './nodes/polygon'
import { Polyline } from './nodes/polyline'
import { RadialGradient } from './nodes/radialgradient'
import { Rect } from './nodes/rect'
import { Svg } from './nodes/svg'
import { SvgNode } from './nodes/svgnode'
import { Symbol } from './nodes/symbol'
import { Use } from './nodes/use'
import { VoidNode } from './nodes/void'
import { forEachChild } from './utils/node'
//import { TextNode } from './nodes/text'
//import { MKitImageNode } from 'ui/app/components/PdfBuilder/jsPDF/ImageNode'
//import { TextNode } from './nodes/text'
import { MKitTextNode } from 'PdfBuilder/jsPDF/TextNode'
import { MaskPath } from './nodes/mask'

export function parse(node: Element, idMap?: { [id: string]: SvgNode }): SvgNode {
  let svgnode: SvgNode;
  const children: SvgNode[] = []

  forEachChild(node, (i, n) => children.push(parse(n, idMap)))
  switch (node.tagName.toLowerCase()) {
    case 'a':
    case 'g':
      svgnode = new Group(node, children)
      break
    case 'circle':
      svgnode = new Circle(node, children)
      break
    case 'clippath':
      svgnode = new ClipPath(node, children)
      break
      // case 'mask':
        
      //   svgnode = new MaskPath(node, children)
      //   break
      case 'ellipse':
      svgnode = new Ellipse(node, children)
      break
    case 'lineargradient':
      svgnode = new LinearGradient(node, children)
      break
    case 'image':
      //AUIT
      //svgnode = new ImageNode(node, children)
      svgnode = new MKitImageNode(node, children);
      break
    case 'line':
      svgnode = new Line(node, children)
      break
    case 'marker':
      svgnode = new MarkerNode(node, children)
      break
    case 'path':
      svgnode = new PathNode(node, children)
      break
    case 'pattern':
      svgnode = new Pattern(node, children)
      break
    case 'polygon':
      svgnode = new Polygon(node, children)
      break
    case 'polyline':
      svgnode = new Polyline(node, children)
      break
    case 'radialgradient':
      svgnode = new RadialGradient(node, children)
      break
    case 'rect':
      svgnode = new Rect(node, children)
      break
    case 'svg':
      svgnode = new Svg(node, children)
      break
    case 'symbol':
      svgnode = new Symbol(node, children)
      break
    case 'text':
      //svgnode = new TextNode(node, children)
      //AUIT
      const tnode = MKitTextNode.buildNode(node, children);
      if (tnode)
          svgnode = tnode
      else 
        svgnode = new VoidNode(node, children)
   
      break
    case 'use':
      svgnode = new Use(node, children)
      break
    default:
      svgnode = new VoidNode(node, children)
      break
  }
  if (idMap != undefined && svgnode.element.hasAttribute('id')) {
    const id = cssesc(svgnode.element.id, { isIdentifier: true })
    idMap[id] = idMap[id] || svgnode
  }

  svgnode.children.forEach(c => c.setParent(svgnode))

  return svgnode
}
