/** next/navigation, stubbed for the library's bundle: a page with no router. */
export const usePathname = () => '/';
export const useRouter = () => ({ push() {}, replace() {}, back() {}, prefetch() {} });
export const useSearchParams = () => new URLSearchParams(typeof location === 'undefined' ? '' : location.search);
