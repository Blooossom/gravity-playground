const SCENE_STORAGE_KEY='mamdaero-scene-v1';
export async function saveSceneData(value){
 const bridge=globalThis.webkit?.messageHandlers?.sceneStorage;
 if(bridge)await bridge.postMessage({action:'save',value});
 else localStorage.setItem(SCENE_STORAGE_KEY,value);
}
export async function loadSceneData(){
 const bridge=globalThis.webkit?.messageHandlers?.sceneStorage;
 return bridge?await bridge.postMessage({action:'load'}):localStorage.getItem(SCENE_STORAGE_KEY);
}
