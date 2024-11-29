import { Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

function StudentsForm({ initialContents, submitAction, buttonLabel = "Create" }) {

    // Stryker disable all
    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm(
        { defaultValues: initialContents || {}, }
    );
    // Stryker restore all

    const navigate = useNavigate();

    const testIdPrefix = "StudentsForm";

    // For explanation, see: https://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
    // Note that even this complex regex may still need some tweaks
    return (

        <Form onSubmit={handleSubmit(submitAction)}>
            <Row>
                {initialContents && (
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="id">Id</Form.Label>
                        <Form.Control
                            // Stryker disable next-line all
                            data-testid={testIdPrefix + "-id"}
                            id="id"
                            type="text"
                            {...register("id")}
                            value={initialContents.id}
                            disabled
                        />
                    </Form.Group>
                )}

                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="perm">Perm</Form.Label>
                        <Form.Control
                            // Stryker disable next-line all
                            data-testid={testIdPrefix + "-perm"}
                            id="perm"
                            type="text"
                            isInvalid={Boolean(errors.perm)}
                            {...register("perm", {
                                required: "The perm number of the student is required.",
                            })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.perm?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="lastName">Last Name</Form.Label>
                        <Form.Control
                            // Stryker disable next-line all
                            data-testid={testIdPrefix + "-lastName"}
                            id="lastName"
                            type="text"
                            isInvalid={Boolean(errors.lastName)}
                            {...register("lastName", {
                                required: "The last name of the student is required.",
                            })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.lastName?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="firstMiddleName">First and Middle Name</Form.Label>
                        <Form.Control
                            // Stryker disable next-line all
                            data-testid={testIdPrefix + "-firstMiddleName"}
                            id="firstMiddleName"
                            type="text"
                            isInvalid={Boolean(errors.firstMiddleName)}
                            {...register("firstMiddleName", {
                                required: "The first and middle names of the student are required.",
                            })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.firstMiddleName?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="email">Email</Form.Label>
                        <Form.Control
                            // Stryker disable next-line all
                            data-testid={testIdPrefix + "-email"}
                            id="email"
                            type="text"
                            isInvalid={Boolean(errors.email)}
                            {...register("email", {
                                required: "The email of the student is required.",
                            })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.email?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="courseId">Course Id</Form.Label>
                        <Form.Control
                            // Stryker disable next-line all
                            data-testid={testIdPrefix + "-courseId"}
                            id="courseId"
                            type="text"
                            isInvalid={Boolean(errors.courseId)}
                            {...register("courseId", {
                                required: "The Course ID is required.",
                            })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.courseId?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Button
                    type="submit"
                    // Stryker disable next-line all
                    data-testid={testIdPrefix + "-submit"}
                >
                    {buttonLabel}
                </Button>
                <Button
                    variant="Secondary"
                    onClick={() => navigate(-1)}
                    // Stryker disable next-line all
                    data-testid={testIdPrefix + "-cancel"}
                >
                    Cancel
                </Button>
            </Row>
        </Form>
    )
}

export default StudentsForm;