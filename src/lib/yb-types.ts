/**
 * YOOBANTÉ — types partagés du prototype
 */
export type YbGo = (id: string) => void;
export type YbNotify = (msg: string) => void;

export interface YbScreenProps {
  /** Navigation prototype : va vers l'écran dont l'id est passé */
  go: YbGo;
  /** Toast interne au cadre téléphone (actions hors prototype) */
  notify: YbNotify;
}
