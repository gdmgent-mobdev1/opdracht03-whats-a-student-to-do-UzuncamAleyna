/**
 * My Element Helper
 */

const Elements = {
  createHeader({
    size = 1, textContent = '',
  }) {
    const header = document.createElement(`h${(size < 1 || size > 6) ? 1 : size}`);
    header.textContent = textContent;
    return header;
  },
};

export default Elements;
