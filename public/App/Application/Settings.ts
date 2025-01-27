export class Settings{
    private static instance: Settings;
    readonly settingsData: SettingsData;
    readonly messageName: string = 'KC - Settings Manager'
    readonly userSettingsStorageName: string = 'KCuserSettings'

    private constructor() {
        let settingString = localStorage.getItem(this.userSettingsStorageName)
        if(!settingString){
            this.settingsData = SettingsDefault
        }else{
            this.settingsData = JSON.parse(settingString)
        }
        window.Print.log(this.messageName, "User Settings Loaded")
    }

    public static Settings(): Settings{
        if(this.instance){
            return this.instance;
        }

        return new Settings();
    }

    public getSetting(settingName: SettingNames): any{
        return this.settingsData[settingName];
    }

    public setSetting(settingName: SettingNames, state: any){
        const prevSetting: any = this.settingsData[settingName];
        this.settingsData[settingName] = state;
        localStorage.setItem(this.userSettingsStorageName, JSON.stringify(this.settingsData))
        window.Print.debug(this.messageName, `User Setting ${settingName} modified from [${prevSetting}] to [${state}]`)
    }
}

type SettingsData = {
    debugMode: boolean;
}

type SettingNames = keyof SettingsData

const SettingsDefault: SettingsData = {
    debugMode: true,
}