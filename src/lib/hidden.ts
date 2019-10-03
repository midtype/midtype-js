import { get } from '../utils/store';
import { singleton } from '../constants/identifiers';
import { accessValue } from '../utils/text';

const checkIfExists = (key: string, data: any) => {
  return accessValue(data, key) || get(key) ? true : false;
};

export const handleHidden = (doc: HTMLElement | HTMLDocument, data: any) => {
  doc
    .querySelectorAll<HTMLElement>('[data-mt-if-not], [data-mt-if]')
    .forEach(el => {
      let visible = false;
      if (el.dataset.mtIfNot && el.dataset.mtIf) {
        const idsIf = el.dataset.mtIf.split(',').map(id => id.trim());
        const idsIfNot = el.dataset.mtIfNot.split(',').map(id => id.trim());
        visible =
          idsIf.every(id => checkIfExists(id, data)) &&
          idsIfNot.every(id => checkIfExists(id, data) === false);
      } else if (el.dataset.mtIfNot) {
        const ids = el.dataset.mtIfNot.split(',').map(id => id.trim());
        visible = ids.every(id => checkIfExists(id, data) === false);
      } else if (el.dataset.mtIf) {
        const ids = el.dataset.mtIf.split(',').map(id => id.trim());
        visible = ids.every(id => checkIfExists(id, data));
      }
      if (visible) {
        el.style.visibility = 'visible';
        el.style.removeProperty('display');
      } else {
        el.style.display = 'none';
      }
    });
};

export const handleHiddenUser = () => {
  document
    .querySelectorAll<HTMLElement>(
      '[data-mt-if-not="user"], [data-mt-if="user"]'
    )
    .forEach(el => {
      let visible = false;
      if (el.dataset.mtIfNot && el.dataset.mtIf) {
        const idsIf = el.dataset.mtIf.split(',').map(id => id.trim());
        const idsIfNot = el.dataset.mtIfNot.split(',').map(id => id.trim());
        visible =
          idsIf.every(id => checkIfExists(id, singleton.data)) &&
          idsIfNot.every(id => checkIfExists(id, singleton.data) === false);
      } else if (el.dataset.mtIfNot) {
        const ids = el.dataset.mtIfNot.split(',').map(id => id.trim());
        visible = ids.every(id => checkIfExists(id, singleton.data) === false);
      } else if (el.dataset.mtIf) {
        const ids = el.dataset.mtIf.split(',').map(id => id.trim());
        visible = ids.every(id => checkIfExists(id, singleton.data));
      }
      if (visible) {
        el.style.visibility = 'visible';
        el.style.removeProperty('display');
      } else {
        el.style.display = 'none';
      }
    });
};
