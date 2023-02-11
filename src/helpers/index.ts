import { startApp } from "..";

let init: any = null;

export const initTestServer = async () => {
    if (init) return init;
    init = await startApp(true);
    return init;
}


