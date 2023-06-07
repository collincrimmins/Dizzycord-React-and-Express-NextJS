import {PulseLoader} from "react-spinners";
import "../css/App.css"

// Components
export const LoadingFrame = ({loading}) => {
    if (loading) {
        return (
            <div className="LoadingFrame">
                <PulseLoader
                    color={"#ffffff"}
                    loading={loading}
                    radius={25}
                    height={45}
                    width={10}
                    margin={25}
                />
            </div>
        )
    }
}

// Functions
export const sleep = (ms) => {
    // Use this line:
    // await sleep(1000);
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const verifyTextInput = (InputText) => {
    if (InputText === "" || !/\S/.test(InputText)) {
        return false
    }
    return true
}