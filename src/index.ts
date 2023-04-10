import app from './settings';
import { settings } from './settings/';
import { connectDB } from "./db";


app.listen(settings.PORT, async () => {
    try {
        await connectDB();
        console.log(`Example app listening on port ${settings.PORT}`);
    } catch (e) {
        console.error(e);
    }
});
