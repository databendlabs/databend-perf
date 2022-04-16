import moment from "moment";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export const DATE_FORMATTER = 'yyyy-MM-DD';
export function formatterDate(date: string, format = DATE_FORMATTER) {
  return moment(date).format(format)
}
export function noneSecurity(textToCopy: string){
		const textArea: HTMLTextAreaElement = document.createElement('textarea');
		textArea.value = textToCopy;
		textArea.style.position = 'absolute';
		textArea.style.opacity = '0';
		textArea.style.left = '-999999px';
		textArea.style.top = '-999999px';
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		return new Promise<void>((res, rej) => {
			document.execCommand('copy') ? res() : rej();
			textArea.remove();
		});
}

// copy text
export function copyToClipboard(textToCopy: string) {
	if (navigator.clipboard && window.isSecureContext) {
    // Compatible with mobile terminals
    noneSecurity(textToCopy);
		// secure  when 'document.execCommand' not working, it will have effected.
		return navigator.clipboard.writeText(textToCopy);
	} else {
    // non-secure
    noneSecurity(textToCopy);
	}
}

// get query
export function useQuery() {
	const { search } = useLocation();
	return useMemo(() => new URLSearchParams(search), [search]);
}

// get query
export function getQuery(key: string) {
	return useQuery().get(key);
}