import { Fill, FillData } from './Fill'
import { Context } from '../context/context'
import { parseTransform } from '../utils/transform'
import { getAttribute } from '../utils/node'
import { Pattern } from '../nodes/pattern'
import { Rect } from '../utils/geometry'
import { GraphicsNode } from '../nodes/graphicsnode'
import { Matrix } from 'jspdf'

export class PatternFill implements Fill {
  private readonly key: string
  private readonly pattern: Pattern

  constructor(key: string, pattern: Pattern) {
    this.key = key
    this.pattern = pattern
  }

  async getFillDataOld(forNode: GraphicsNode, context: Context): Promise<FillData | undefined> {
    // await context.refsHandler.getRendered(this.key, null, node =>
    //   (node as Pattern).apply(
    //     new Context(context.pdf, {
    //       refsHandler: context.refsHandler,
    //       textMeasure: context.textMeasure,
    //       styleSheets: context.styleSheets,
    //       viewport: context.viewport,
    //       svg2pdfParameters: context.svg2pdfParameters
    //     })
    //   )
    // )
// AUIT Matrix erst berechnen dann rendern
    const patternData: PatternData = {
      key: this.key,
      boundingBox: undefined,
      xStep: 0,
      yStep: 0,
      matrix: undefined
    }

    let bBox
    let patternUnitsMatrix = context.pdf.unitMatrix
    if (
      !this.pattern.element.hasAttribute('patternUnits') ||
      this.pattern.element.getAttribute('patternUnits')!.toLowerCase() === 'objectboundingbox'
    ) {
      bBox = forNode.getBoundingBox(context)
      patternUnitsMatrix = context.pdf.Matrix(1, 0, 0, 1, bBox[0], bBox[1])

      const fillBBox = this.pattern.getBoundingBox(context)
      const x = fillBBox[0] * bBox[0] || 0
      const y = fillBBox[1] * bBox[1] || 0
      const width = fillBBox[2] * bBox[2] || 0
      const height = fillBBox[3] * bBox[3] || 0
      patternData.boundingBox = [x, y, x + width, y + height]
      patternData.xStep = width
      patternData.yStep = height
    }

    let patternContentUnitsMatrix = context.pdf.unitMatrix
    if (
      this.pattern.element.hasAttribute('patternContentUnits') &&
      this.pattern.element.getAttribute('patternContentUnits')!.toLowerCase() ===
        'objectboundingbox'
    ) {
      bBox || (bBox = forNode.getBoundingBox(context))
      patternContentUnitsMatrix = context.pdf.Matrix(bBox[2], 0, 0, bBox[3], 0, 0)

      const fillBBox = patternData.boundingBox || this.pattern.getBoundingBox(context)
      const x = fillBBox[0] / bBox[0] || 0
      const y = fillBBox[1] / bBox[1] || 0
      const width = fillBBox[2] / bBox[2] || 0
      const height = fillBBox[3] / bBox[3] || 0
      patternData.boundingBox = [x, y, x + width, y + height]
      patternData.xStep = width
      patternData.yStep = height
    }

    let patternTransformMatrix = context.pdf.unitMatrix
    const patternTransform = getAttribute(
      this.pattern.element,
      context.styleSheets,
      'patternTransform',
      'transform'
    )
    if (patternTransform) {
      patternTransformMatrix = parseTransform(patternTransform, context)
    }

    let matrix = patternContentUnitsMatrix
    matrix = context.pdf.matrixMult(matrix, patternUnitsMatrix) // translate by
    matrix = context.pdf.matrixMult(matrix, patternTransformMatrix)
    matrix = context.pdf.matrixMult(matrix, context.transform)

    patternData.matrix = matrix


    await context.refsHandler.getRendered(this.key, null, node =>
      (node as Pattern).apply(
        new Context(context.pdf, {
          refsHandler: context.refsHandler,
          textMeasure: context.textMeasure,
          styleSheets: context.styleSheets,
          viewport: context.viewport,
          svg2pdfParameters: context.svg2pdfParameters,
          patternData:patternData
        })
      )
    )
    return patternData
  }

 async getFillData(forNode: GraphicsNode, context: Context): Promise<FillData | undefined> {
    // await context.refsHandler.getRendered(this.key, null, node =>
    //   (node as Pattern).apply(
    //     new Context(context.pdf, {
    //       refsHandler: context.refsHandler,
    //       textMeasure: context.textMeasure,
    //       styleSheets: context.styleSheets,
    //       viewport: context.viewport,
    //       svg2pdfParameters: context.svg2pdfParameters
    //     })
    //   )
    // )
// AUIT Matrix erst berechnen dann rendern
    const patternData: PatternData = {
      key: this.key,
      boundingBox: undefined,
      xStep: 0,
      yStep: 0,
      matrix: undefined
    }

    let bBox
    let patternUnitsMatrix = context.pdf.unitMatrix
    const patternUnits = this.pattern.element.getAttribute('patternUnits')
      ? this.pattern.element.getAttribute('patternUnits')!.toLowerCase()
      : 'objectboundingbox'

    if (patternUnits === 'objectboundingbox') {
      bBox = forNode.getBoundingBox(context)
      // Die Transformation für objectBoundingBox skaliert und verschiebt das Muster basierend auf der Bounding Box des Elements.
      // Hier wird die Matrix so gesetzt, dass sie die Bounding Box des Elements berücksichtigt.
      // Die ursprüngliche Implementierung schien hier einen Fehler zu haben, da sie nur die Verschiebung berücksichtigte.
      // Die korrekte Matrix für objectBoundingBox sollte Skalierung und Verschiebung beinhalten,
      // aber da die Bounding Box des Musters (x, y, width, height) bereits in objectBoundingBox-Koordinaten (0-1)
      // interpretiert wird, wird die Skalierung später über die Bounding Box des Musters selbst vorgenommen.
      // Die Matrix hier sollte nur die Verschiebung des Elements berücksichtigen, wenn die Bounding Box des Musters
      // relativ zur Bounding Box des Elements berechnet wird.
      // Da die Original-Implementierung nur eine Verschiebung (bBox[0], bBox[1]) verwendet, belassen wir das für die Kompatibilität
      // mit der Original-Logik, aber die Skalierung (bBox[2], bBox[3]) fehlt hier für eine korrekte objectBoundingBox-Implementierung.
      // Für userSpaceOnUse ist die Matrix die Einheitsmatrix, da keine Transformation basierend auf der Bounding Box des Elements
      // angewendet werden soll.
      patternUnitsMatrix = context.pdf.Matrix(1, 0, 0, 1, bBox[0], bBox[1])

      const fillBBox = this.pattern.getBoundingBox(context)
      const x = fillBBox[0] * bBox[2] || 0 // x * width
      const y = fillBBox[1] * bBox[3] || 0 // y * height
      const width = fillBBox[2] * bBox[2] || 0 // width * width
      const height = fillBBox[3] * bBox[3] || 0 // height * height
      patternData.boundingBox = [x, y, x + width, y + height]
      patternData.xStep = width
      patternData.yStep = height
    } else if (patternUnits === 'userspaceonuse') {
      // Bei userSpaceOnUse wird das Muster im Koordinatensystem des Benutzers (des SVG-Viewports) platziert.
      // Die patternUnitsMatrix ist die Einheitsmatrix, da keine zusätzliche Transformation basierend auf der Bounding Box
      // des Elements angewendet werden soll.
      patternUnitsMatrix = context.pdf.unitMatrix

      const fillBBox = this.pattern.getBoundingBox(context)
      const x = fillBBox[0] || 0
      const y = fillBBox[1] || 0
      const width = fillBBox[2] || 0
      const height = fillBBox[3] || 0
      patternData.boundingBox = [x, y, x + width, y + height]
      patternData.xStep = width
      patternData.yStep = height
    }


    let patternContentUnitsMatrix = context.pdf.unitMatrix
    const patternContentUnits = this.pattern.element.getAttribute('patternContentUnits')
      ? this.pattern.element.getAttribute('patternContentUnits')!.toLowerCase()
      : patternUnits // Standardmäßig ist patternContentUnits gleich patternUnits

    if (patternContentUnits === 'objectboundingbox') {
      bBox || (bBox = forNode.getBoundingBox(context))
      patternContentUnitsMatrix = context.pdf.Matrix(bBox[2], 0, 0, bBox[3], 0, 0)

      const fillBBox = patternData.boundingBox || this.pattern.getBoundingBox(context)
      const x = fillBBox[0] / bBox[2] || 0 // x / width
      const y = fillBBox[1] / bBox[3] || 0 // y / height
      const width = fillBBox[2] / bBox[2] || 0 // width / width
      const height = fillBBox[3] / bBox[3] || 0 // height / height
      patternData.boundingBox = [x, y, x + width, y + height]
      patternData.xStep = width
      patternData.yStep = height
    } else if (patternContentUnits === 'userspaceonuse') {
      // Bei userSpaceOnUse ist die Matrix die Einheitsmatrix, da die Koordinaten des Musters
      // bereits im Benutzerkoordinatensystem interpretiert werden.
      patternContentUnitsMatrix = context.pdf.unitMatrix
    }

    let patternTransformMatrix = context.pdf.unitMatrix
    const patternTransform = getAttribute(
      this.pattern.element,
      context.styleSheets,
      'patternTransform',
      'transform'
    )
    if (patternTransform) {
      patternTransformMatrix = parseTransform(patternTransform, context)
    }

    let matrix = patternContentUnitsMatrix
    matrix = context.pdf.matrixMult(matrix, patternUnitsMatrix) // translate by
    matrix = context.pdf.matrixMult(matrix, patternTransformMatrix)
    matrix = context.pdf.matrixMult(matrix, context.transform)

    patternData.matrix = matrix


    await context.refsHandler.getRendered(this.key, null, node =>
      (node as Pattern).apply(
        new Context(context.pdf, {
          refsHandler: context.refsHandler,
          textMeasure: context.textMeasure,
          styleSheets: context.styleSheets,
          viewport: context.viewport,
          svg2pdfParameters: context.svg2pdfParameters,
          patternData:patternData
        })
      )
    )
    return patternData
  }
}

interface PatternData {
  key: string
  boundingBox?: Rect
  xStep: number
  yStep: number
  matrix?: Matrix
}
