// Deklarasi custom element agar tidak error di TypeScript
// Simpan file ini sebagai livepeer-player.d.ts di root project atau di folder types/
declare namespace JSX {
  interface IntrinsicElements {
    'livepeer-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      theme?: string;
      controls?: boolean;
      style?: React.CSSProperties;
      muted?: boolean;
      autoPlay?: boolean;
    };
  }
}
