// src/hooks/useLang.js
import { useState } from 'react';
import { getLang, setLang as saveLang } from '../i18n';

export function useLang() {
  const [lang, setLangState] = useState(getLang());

  const changeLang = (newLang) => {
    setLangState(newLang);
    saveLang(newLang);
  };

  return [lang, changeLang];
}