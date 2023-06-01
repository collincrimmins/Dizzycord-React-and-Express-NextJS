import React, {useState, useRef} from 'react'
import { useAuthContext } from '../AuthContext'
import "../css/Login.css"
import "../css/App.css"

export default function ResetPassword({viewLogin}) {
    const {resetPassword} = useAuthContext()
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const [emptyFields, setEmptyFields] = useState([])
    const [loading, setLoading] = useState(false)
    const emailRef = useRef()

    async function handleSubmit(e) {
        e.preventDefault()
        let email = emailRef.current.value

        // Check Fields
        let invalidInput = false
        setEmptyFields("")
        if (email == "") {
            invalidInput = true
            setEmptyFields((prevState) => (prevState + " email"))
        }
        if (invalidInput) {
            return setError("Fill in Missing Fields.")
        }

        try {
            setMessage("")
            setError("")
            setLoading(true)
            await resetPassword(emailRef.current.value)
            setMessage("Email sent.")
        } catch {
            setError("Failed to Reset Password.")
        }
        setLoading(false)
    }

    return (
        <>
            <div className="BodyLogin CenterDivColumn">
                <div className="HeaderMain">Reset Password</div>
                <form className="ContainerCentered">
                    <label>Email:</label>
                    <input
                        type="email"
                        className={"Input " + (emptyFields.includes("email") ? "InputError" : "")} 
                        ref={emailRef}
                    />

                    <div className="CenterItems">
                        <button className="ButtonRounded ButtonBlue ButtonBold ButtonTextLarge SignUpButton" onClick={handleSubmit} disabled={loading}>Reset</button>
                    </div>

                    {message && 
                        <div className="ContainerSuccess">
                            {message}
                        </div>
                    }
                    {error && 
                        <div className="ContainerError">
                            {error}
                        </div>
                    }
                </form>
                <div className="ContainerCentered">
                    <button onClick={viewLogin} className="ButtonRounded ButtonGray">Back to Login</button>
                </div>
            </div>
            {/* <Container className="d-flex align-items-center justify-content-center" style={{minHeight: "100vh", maxWidth: "400px"}}>
                <div className="w-100">
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4">Reset Password</h2>
                            {message && <Alert variant="success">{message}</Alert>}
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group id="email">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" ref={emailRef} required></Form.Control>
                                </Form.Group>
                                <br></br>
                                <Button disabled={loading} className="w-100" type="submit">Submit</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                    <div className="w-100 text-center mt-2">
                        <br></br>
                        <Button onClick={navigateToLogin} className="w-50" style={styles.customButton}>Back to Login</Button>
                    </div>
                </div>
            </Container> */}
        </>
    )
}
