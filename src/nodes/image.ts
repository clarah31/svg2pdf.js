import { Matrix } from 'jspdf'
import { Context } from '../context/context'
import { ReferencesHandler } from '../context/referenceshandler'
import { Viewport } from '../context/viewport'
import { parse } from '../parse'
import { defaultBoundingBox } from '../utils/bbox'
import { Rect } from '../utils/geometry'
import { getAttribute, svgNodeIsVisible } from '../utils/node'
import { GraphicsNode } from './graphicsnode'
import { SvgNode } from './svgnode'

// groups: 1: mime-type (+ charset), 2: mime-type (w/o charset), 3: charset, 4: base64?, 5: body
export const dataUriRegex =
  /^\s*data:(([^/,;]+\/[^/,;]+)(?:;([^,;=]+=[^,;=]+))?)?(?:;(base64))?,((?:.|\s)*)$/i
export class ImageNode extends GraphicsNode {
  private readonly imageLoadingPromise: Promise<{ data: string; format: string }> | null = null
  private readonly imageUrl: string | null

  constructor(element: Element, children: SvgNode[]) {
    super(element, children)
    this.imageUrl = this.element.getAttribute('xlink:href') || this.element.getAttribute('href')
    // this.imageUrl = this.element.getAttribute('xlink:href') || this.element.getAttribute('href')
    // this.imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/7/70/Example.png';
    // this.imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Example.jpg'
    if (this.imageUrl) {
      // start loading the image as early as possible
      this.imageLoadingPromise = ImageNode.fetchImageData(this.imageUrl)
    }
  }

  protected async renderCore(context: Context): Promise<void> {
    if (!this.imageLoadingPromise) {
      return
    }

    context.pdf.setCurrentTransformationMatrix(context.transform)
    const width = parseFloat(getAttribute(this.element, context.styleSheets, 'width') || '0'),
      height = parseFloat(getAttribute(this.element, context.styleSheets, 'height') || '0'),
      x = parseFloat(getAttribute(this.element, context.styleSheets, 'x') || '0'),
      y = parseFloat(getAttribute(this.element, context.styleSheets, 'y') || '0')

    if (!isFinite(width) || width <= 0 || !isFinite(height) || height <= 0) {
      return
    }

    const { data, format } = await this.imageLoadingPromise

    if (format.indexOf('svg') === 0) {
      const parser = new DOMParser()
      const svgElement = parser.parseFromString(data, 'image/svg+xml').firstElementChild as Element

      // unless preserveAspectRatio starts with "defer", the preserveAspectRatio attribute of the svg is ignored
      const preserveAspectRatio = this.element.getAttribute('preserveAspectRatio')
      if (
        !preserveAspectRatio ||
        preserveAspectRatio.indexOf('defer') < 0 ||
        !svgElement.getAttribute('preserveAspectRatio')
      ) {
        svgElement.setAttribute('preserveAspectRatio', preserveAspectRatio || '')
      }

      svgElement.setAttribute('x', String(x))
      svgElement.setAttribute('y', String(y))
      svgElement.setAttribute('width', String(width))
      svgElement.setAttribute('height', String(height))

      const idMap: { [id: string]: SvgNode } = {}
      const svgnode = parse(svgElement, idMap)
      await svgnode.render(
        new Context(context.pdf, {
          refsHandler: new ReferencesHandler(idMap),
          styleSheets: context.styleSheets,
          viewport: new Viewport(width, height),
          svg2pdfParameters: context.svg2pdfParameters,
          textMeasure: context.textMeasure,
          patternData: context.patternData,
        })
      )
      return
    } else {
      const dataUri = `data:image/${format};base64,${btoa(data)}`
      try {
        // AUIT
        if (getAttribute(this.element, context.styleSheets, 'overflow') == 'hidden') {
        }
        await context.pdf.addImage(
          {
            id: '' + getAttribute(this.element, context.styleSheets, 'id'),
            dataUri: dataUri,
            aspectRatio: getAttribute(this.element, context.styleSheets, 'preserveAspectRatio'),
            overflow: getAttribute(this.element, context.styleSheets, 'overflow'),
            opacity: getAttribute(this.element, context.styleSheets, 'opacity'),
            patternWidth: undefined,
            patternHeight: undefined,
          },
          x,
          y,
          width,
          height
        )
      } catch (e) {
        typeof console === 'object' &&
          console.warn &&
          console.warn(`Could not load image ${this.imageUrl}. \n${e}`)
      }
    }
  }

  protected getBoundingBoxCore(context: Context): Rect {
    return defaultBoundingBox(this.element, context)
  }

  computeNodeTransformCore(context: Context): Matrix {
    return context.pdf.unitMatrix
  }

  isVisible(parentVisible: boolean, context: Context): boolean {
    return svgNodeIsVisible(this, parentVisible, context)
  }

  static async fetchImageData(imageUrl: string): Promise<{ data: string; format: string }> {
    let data, format

    const match = imageUrl.match(dataUriRegex)
    if (match) {
      const mimeType = match[2]
      const mimeTypeParts = mimeType.split('/')
      if (mimeTypeParts[0] !== 'image') {
        throw new Error(`Unsupported image URL: ${imageUrl}`)
      }

      format = mimeTypeParts[1]

      data = match[5]

      if (match[4] === 'base64') {
        data = data.replace(/\s/g, '')
        data = atob(data)
      } else {
        data = decodeURIComponent(data)
      }
    } else {
      data = await ImageNode.fetchImage(imageUrl)
      format = imageUrl.substring(imageUrl.lastIndexOf('.') + 1)
    }

    return {
      data,
      format,
    }
  }

  static fetchImage(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', imageUrl, true)
      xhr.responseType = 'arraybuffer'

      xhr.onload = (): void => {
        if (xhr.status !== 200) {
          throw new Error(`Error ${xhr.status}: Failed to load image '${imageUrl}'`)
        }

        const bytes = new Uint8Array(xhr.response)
        let data = ''
        for (let i = 0; i < bytes.length; i++) {
          data += String.fromCharCode(bytes[i])
        }
        resolve(data)
      }
      xhr.onerror = reject
      xhr.onabort = reject

      xhr.send(null)
    })
  }

  static getMimeType(format: string): string {
    format = format.toLowerCase()
    switch (format) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg'
      default:
        return `image/${format}`
    }
  }
}
