import { ColorFill } from "../fill/ColorFill";
import { Fill } from "../fill/Fill";
import { RGBColor } from "../utils/rgbcolor";
import { Context } from "./context";

export class AttributeState {
  public xmlSpace = "";
  public fill: Fill | null = null;
  public fillOpacity = 1.0;
  // public fillRule: string = null
  public fontFamily = "";
  public fontSize = 16;
  public fontStyle = "";
  // public fontVariant: string
  public fontWeight = "";
  public opacity = 1.0;
  public stroke: Fill | null = null;
  public strokeDasharray: number[] | null = null;
  public strokeDashoffset = 0;
  public strokeLinecap = "";
  public strokeLinejoin = "";
  public strokeMiterlimit = 4.0;
  public strokeOpacity = 1.0;
  public strokeWidth = 1.0;
  // public textAlign: string
  public alignmentBaseline = "";
  public textAnchor = "";
  public visibility = "";
  public mixBlendMode = "";
  public color: RGBColor | null = null;
  public contextFill: RGBColor | null = null;
  public contextStroke: RGBColor | null = null;
  public fillRule: string | null = null;

  clone(): AttributeState {
    const clone = new AttributeState();

    clone.xmlSpace = this.xmlSpace;
    clone.fill = this.fill;
    clone.fillOpacity = this.fillOpacity;
    // clone.fillRule = this.fillRule;
    clone.fontFamily = this.fontFamily;
    clone.fontSize = this.fontSize;
    clone.fontStyle = this.fontStyle;
    // clone.fontVariant = this.fontVariant;
    clone.fontWeight = this.fontWeight;
    clone.opacity = this.opacity;
    clone.stroke = this.stroke;
    clone.strokeDasharray = this.strokeDasharray;
    clone.strokeDashoffset = this.strokeDashoffset;
    clone.strokeLinecap = this.strokeLinecap;
    clone.strokeLinejoin = this.strokeLinejoin;
    clone.strokeMiterlimit = this.strokeMiterlimit;
    clone.strokeOpacity = this.strokeOpacity;
    clone.strokeWidth = this.strokeWidth;
    // clone.textAlign = this.textAlign;
    clone.textAnchor = this.textAnchor;
    clone.alignmentBaseline = this.alignmentBaseline;
    clone.visibility = this.visibility;
    clone.color = this.color;
    clone.fillRule = this.fillRule;

    clone.contextFill = this.contextFill;
    clone.contextStroke = this.contextStroke;

    return clone;
  }

  static default(): AttributeState {
    const attributeState = new AttributeState();

    attributeState.xmlSpace = "default";
    attributeState.fill = new ColorFill(new RGBColor("rgb(255, 255, 255)")); // AUIT
    attributeState.fillOpacity = 1.0;
    // attributeState.fillRule = "nonzero";
    attributeState.fontFamily = "Inter"; // AUIT
    attributeState.fontSize = 16;
    attributeState.fontStyle = "normal";
    // attributeState.fontVariant = "normal";
    attributeState.fontWeight = "normal";
    attributeState.opacity = 1.0;
    attributeState.stroke = null;
    attributeState.strokeDasharray = null;
    attributeState.strokeDashoffset = 0;
    attributeState.strokeLinecap = "butt";
    attributeState.strokeLinejoin = "miter";
    attributeState.strokeMiterlimit = 4.0;
    attributeState.strokeOpacity = 1.0;
    attributeState.strokeWidth = 1.0;
    // attributeState.textAlign = "start";
    attributeState.alignmentBaseline = "baseline";
    attributeState.textAnchor = "start";
    attributeState.visibility = "visible";
    attributeState.color = new RGBColor("rgb(0, 0, 0)");
    attributeState.fillRule = "nonzero";

    attributeState.contextFill = null;
    attributeState.contextStroke = null;

    return attributeState;
  }

  static getContextColors(context: Context, includeCurrentColor = false): ContextColors {
    const colors: ContextColors = {};
    if (context.attributeState.contextFill) {
      colors["contextFill"] = context.attributeState.contextFill;
    }

    if (context.attributeState.contextStroke) {
      colors["contextStroke"] = context.attributeState.contextStroke;
    }

    if (includeCurrentColor && context.attributeState.color) {
      colors["color"] = context.attributeState.color;
    }
    return colors;
  }
}

export type ContextColors = Partial<Pick<AttributeState, "color" | "contextFill" | "contextStroke">>;
