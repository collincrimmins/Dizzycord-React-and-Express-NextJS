import {PulseLoader, MoonLoader} from "react-spinners";
import "../css/App.css"

// Components
export const LoadingFrameFullScreen = ({loading}) => {
    if (loading) {
        return (
            <div className="LoadingFrameFullScreen">
                <MoonLoader
                    color={"#4287f5"}
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

export const LoadingFrameFill = ({loading}) => {
    if (loading) {
        return (
            <div className="LoadingFrameFill">
                <MoonLoader
                    color={"#4287f5"}
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
export const RemoveDuplicates = (array) => {
    let NewList = []
    array.forEach((e) => {
        if (!NewList.find((q) => q === e)) {
            NewList.push(e)
        }
    })
    return NewList
}

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