export const debounce = (callback: (...args: any[]) => void, wait: number) => {
  let timeoutId: number | null = null;

  return (...args: any[]) => {
    window.clearTimeout(timeoutId as number);

    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
};

type TCookieItem = [string, string];

type ICookieArray = Array<TCookieItem>;

export const parseCookie = (data: string) => {
  const parsed: ICookieArray = data.split('; ').map((item) => item.split('=') as TCookieItem);

  return new Map<string, string>(parsed);
};
