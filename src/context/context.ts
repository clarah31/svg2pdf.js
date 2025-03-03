import { ReferencesHandler } from './referenceshandler'
import { AttributeState } from './attributestate'
import { TextMeasure } from './textmeasure'
import { StyleSheets } from './stylesheets'
import { jsPDF, Matrix, PatternData } from 'jspdf'
import { Viewport } from './viewport'

/**
 *
 * @package
 * @param values
 * @constructor
 * @property pdf
 * @property attributeState  Keeps track of parent attributes that are inherited automatically
 * @property refsHandler  The handler that will render references on demand
 * @property styleSheets
 * @property textMeasure
 * @property transform The current transformation matrix
 * @property withinClipPath
 */
export class Context {
  pdf: jsPDF
  svg2pdfParameters: Svg2pdfParameters
  attributeState: AttributeState
  viewport: Viewport
  refsHandler: ReferencesHandler
  styleSheets: StyleSheets
  textMeasure: TextMeasure
  transform: Matrix
  withinClipPath: boolean
  withinMaskPath: boolean
  withinUse: boolean
  inEffectNode: number
  //AUIT
  patternData:PatternData
  constructor(pdf: jsPDF, values: ContextOptions) {
    this.pdf = pdf
    this.svg2pdfParameters = values.svg2pdfParameters

    this.attributeState = values.attributeState
      ? values.attributeState.clone()
      : AttributeState.default()
    this.viewport = values.viewport
    this.refsHandler = values.refsHandler
    this.styleSheets = values.styleSheets
    this.textMeasure = values.textMeasure
    this.transform = values.transform ?? this.pdf.unitMatrix
    this.withinClipPath = values.withinClipPath ?? false
    this.withinMaskPath = values.withinMaskPath ?? false
    this.withinUse = values.withinUse ?? false
    this.inEffectNode= values.inEffectNode ?? 0

    //AUIT
    this.patternData = values.patternData
  }

  clone(
    values: {
      viewport?: Viewport
      attributeState?: AttributeState
      transform?: Matrix
      withinClipPath?: boolean
      withinMaskPath?: boolean
      withinUse?: boolean
      inEffectNode?: number
      patternData?:PatternData
    } = {}
  ): Context {
    return new Context(this.pdf, {
      svg2pdfParameters: this.svg2pdfParameters,
      attributeState: values.attributeState
        ? values.attributeState.clone()
        : this.attributeState.clone(),
      viewport: values.viewport ?? this.viewport,
      refsHandler: this.refsHandler,
      styleSheets: this.styleSheets,
      textMeasure: this.textMeasure,
      transform: values.transform ?? this.transform,
      withinClipPath: values.withinClipPath ?? this.withinClipPath,
      withinMaskPath: values.withinMaskPath ?? this.withinMaskPath,
      withinUse: values.withinUse ?? this.withinUse,
      inEffectNode: values.inEffectNode ?? this.inEffectNode,
      patternData: values.patternData ?? this.patternData,
    })
  }
}

export interface ContextOptions {
  svg2pdfParameters: Svg2pdfParameters
  viewport: Viewport
  attributeState?: AttributeState
  refsHandler: ReferencesHandler
  styleSheets: StyleSheets
  textMeasure: TextMeasure
  patternData:PatternData
  transform?: Matrix
  withinClipPath?: boolean
  withinUse?: boolean
  // AUIT
  withinMaskPath?: boolean
  inEffectNode?: number
}

export interface Svg2pdfParameters {
  element: Element
  x?: number
  y?: number
  width?: number
  height?: number
  loadExternalStyleSheets?: boolean
}
