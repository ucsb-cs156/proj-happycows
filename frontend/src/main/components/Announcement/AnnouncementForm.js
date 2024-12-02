import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

function AnnouncementForm({ initialContents, submitAction, buttonLabel = "Create" }) {

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

    const testIdPrefix = "AnnouncementForm";

    return (

        <Form onSubmit={handleSubmit(submitAction)}>

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

            <Form.Group className="mb-3">
                <Form.Label htmlFor="startDate">Start Date</Form.Label>
                <Form.Control
                // Stryker disable next-line all
                    data-testid={testIdPrefix + "-startDate"}
                    id="startDate"
                    type="datetime-local"
                    isInvalid={Boolean(errors.startDate)}
                    {...register("startDate", {
                        required: "StartDate is required.",
                    })}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.startDate && 'Start Date is required and must be provided in ISO format.'}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label htmlFor="endDate">End Date</Form.Label>
                <Form.Control
                // Stryker disable next-line all
                    data-testid={testIdPrefix + "-endDate"}
                    id="endDate"
                    type="datetime-local"
                    isInvalid={Boolean(errors.startDate)}
                    {...register("endDate", {
                    })}
                />
            </Form.Group>


            <Form.Group className="mb-3">
                <Form.Label htmlFor="announcementText">Announcement</Form.Label>
                <Form.Control
                    as="textarea"
                    // Stryker disable next-line all
                    data-testid={testIdPrefix + "-announcementText"}
                    id="announcementText"
                    rows={5}
                    isInvalid={Boolean(errors.announcementText)}
                    {...register("announcementText", {
                        required: "Announcement is required."
                    })}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.announcementText?.message}
                </Form.Control.Feedback>
            </Form.Group>

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

        </Form>
    );
}

export default AnnouncementForm;