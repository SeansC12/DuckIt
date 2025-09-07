import { Summary } from "./Summary";
import { TextFile } from "./TextFile";

export interface Session {
  id: string;
  name: string;
  date: Date;
  files: Array<TextFile>;
  summary: Summary;
}
