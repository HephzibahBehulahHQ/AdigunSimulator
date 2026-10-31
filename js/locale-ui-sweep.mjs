import { TRANSLATIONS, UI_KEYS, UI_LOCALES } from "./i18n.mjs";
const ATTR=/\bdata-i18n(?:-placeholder|-title|-aria|-alt)?="([^"]+)"/g;
export function auditUiSource(html,css) {
  const referenced=[...html.matchAll(ATTR)].map(match=>match[1]);
  const undeclared=[...new Set(referenced.filter(key=>!UI_KEYS.includes(key)))];
  const missing=[];
  for(const locale of UI_LOCALES)for(const key of UI_KEYS)if(typeof TRANSLATIONS[locale]?.[key]!=="string"||!TRANSLATIONS[locale][key].trim())missing.push(locale+":"+key);
  const unlabeledButtons=[...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)].flatMap(([,attrs,body],index)=>{
    const hasName=/\b(?:aria-label|data-i18n-aria|title|data-i18n-title)="[^"]+"/i.test(attrs);
    const visible=body.replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").trim();
    return hasName||visible?[]:["button-"+index];
  });
  const unlabeledControls=[...html.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)].flatMap(([,tag,attrs],index)=>{
    if(/\btype="hidden"|\bhidden(?:\s|$)/i.test(attrs))return [];
    const id=attrs.match(/\bid="([^"]+)"/i)?.[1], escaped=id?.replaceAll(".","\\.");
    const hasName=/\b(?:aria-label|data-i18n-aria)="[^"]+"/i.test(attrs);
    const explicit=escaped&&new RegExp('<label\\b[^>]*\\bfor="'+escaped+'"','i').test(html);
    const wrapped=escaped&&new RegExp('<label\\b[^>]*>[\\s\\S]*?\\bid="'+escaped+'"[\\s\\S]*?<\\/label>','i').test(html);
    return hasName||explicit||wrapped?[]:[tag+"-"+index];
  });
  const unlabeledImages=[...html.matchAll(/<img\b([^>]*)>/gi)].flatMap(([,attrs],index)=>/\balt="[^"]+"/i.test(attrs)?[]:["image-"+index]);
  const mobile=css.match(/@media\s*\(max-width:\s*800px\)[\s\S]*?(?=@media\s*\(|$)/i)?.[0]??"";
  const overflowGuards={
    smallScreenSingleColumn:/\.workspace\s*\{[^}]*grid-template-columns:\s*1fr/i.test(mobile),
    toolbarCanScroll:/\.canvas-toolbar\s*\{[^}]*overflow:\s*auto\s+hidden/i.test(mobile),
    botFlowsOnSmallScreen:/\.bot-panel\s*\{[^}]*position:\s*static/i.test(mobile),
    canvasCanShrink:/\.canvas-area\s*\{[^}]*min-width:\s*0/i.test(css),
    longLibraryTextWrap:/overflow-wrap:\s*anywhere/i.test(css)
  };
  const failedGuards=Object.entries(overflowGuards).filter(([,passed])=>!passed).map(([name])=>name);
  return {localeCount:UI_LOCALES.length,locales:[...UI_LOCALES],declaredKeyCount:UI_KEYS.length,referencedKeyCount:referenced.length,missingTranslations:missing,undeclaredKeys:undeclared,unlabeledButtons,unlabeledControls,unlabeledImages,overflowGuards,failedGuards,passed:missing.length===0&&undeclared.length===0&&unlabeledButtons.length===0&&unlabeledControls.length===0&&unlabeledImages.length===0&&failedGuards.length===0,renderedPixelCheck:false};
}
export function runFourLanguageUiSweep(project) {
  if(project?.localeUiSweep?.kind!=="four-language-ui-sweep")return {state:"blocked",engine:"Four-language UI coverage sweep",message:"UI sweep configuration is missing.",errors:[{code:"UI_SWEEP_CONFIG",message:"Provide a four-language-ui-sweep project fixture."}],warnings:[],result:null};
  const missing=[];
  for(const locale of UI_LOCALES)for(const key of UI_KEYS)if(typeof TRANSLATIONS[locale]?.[key]!=="string"||!TRANSLATIONS[locale][key].trim())missing.push(locale+":"+key);
  if(missing.length)return {state:"blocked",engine:"Four-language UI coverage sweep",message:"One or more declared translations are missing.",errors:missing.map(key=>({code:"UI_TRANSLATION_MISSING",message:key})),warnings:[],result:null};
  return {state:"complete",engine:"Four-language UI coverage sweep",message:"All declared interface translations are present in English, German, Yorùbá, and Nigerian Pidgin. Source-level accessibility and responsive overflow guards are checked by the catalogue QA test; no rendered-pixel result is claimed.",errors:[],warnings:[],result:{kind:"four-language-ui-sweep",localeCount:UI_LOCALES.length,locales:[...UI_LOCALES],declaredKeyCount:UI_KEYS.length,missingTranslations:0,renderedPixelCheck:false}};
}