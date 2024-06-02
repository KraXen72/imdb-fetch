const debounceSimple = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export function fancyLinkOpen(url: string) {
	setTimeout(() => { window.open(url, '_blank') }, 300)
}

export function copyToClipboard(whattocopy: string) {
	setTimeout(() => {
		let copying = document.getElementById('copyinp') as HTMLInputElement;
		copying.value = whattocopy;
		copying.select();
		document.execCommand("copy");
	}, 300)
}