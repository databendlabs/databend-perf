import moment from "moment";

export const DATE_FORMATTER = 'yyyy-MM-DD';
export function formatterDate(date: string, format = DATE_FORMATTER) {
  return moment(date).format(format)
}