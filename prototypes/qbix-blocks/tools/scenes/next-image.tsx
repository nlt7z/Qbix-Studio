/** next/image, stubbed for the library's bundle: a plain img. */
import { createElement, type ImgHTMLAttributes } from 'react';

export default function Image({ src, alt = '', ...rest }: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  return createElement('img', { src, alt, ...rest });
}
