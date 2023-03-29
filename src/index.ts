import app from './settings';
import { settings } from './settings/';
import { connectDB } from "./db";

app.listen(settings.PORT, async () => {
    await connectDB();
    console.log(`Example app listening on port ${settings.PORT}`);
});