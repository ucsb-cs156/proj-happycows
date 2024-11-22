import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

function AnnouncementForm({ initialContents, submitAction, buttonLabel = "Create" }) {

    // Stryker disable all
    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm({
        defaultValues: {
            ...initialContents,
            startDate: initialContents?.startDate || "",
        },
    });
    // Stryker restore all

    const navigate = useNavigate();
    const testIdPrefix = "AnnouncementForm";

    const isodate_regex = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/i;

    // Get the current date-time formatted for datetime-local inputs
    const getCurrentDateTime = () => {
        const now = new Date();
        return now.toISOString().slice(0, 16); // Matches `datetime-local` format
    };

    const onSubmit = (data) => {
        if (!data.startDate) {
            data.startDate = new Date().toISOString(); // Default to current datetime if not provided
        }
        submitAction(data);
    };

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            {initialContents && (
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="id">Id</Form.Label>
                    <Form.Control
                        // Stryker disable next-line all
                        data-testid={`${testIdPrefix}-id`}
                        id="id"
                        type="text"
                        {...register("id")}
                        value={initialContents.id}
                        disabled
                    />
                </Form.Group>
            )}

            <Form.Group className="mb-3">
                <Form.Label htmlFor="startDate">
                    Start Date <small>(defaults to current time)</small> {/* Explanation added */}
                </Form.Label>
                <Form.Control
                    // Stryker disable next-line all
                    data-testid={`${testIdPrefix}-startDate`}
                    id="startDate"
                    type="datetime-local"
                    placeholder={getCurrentDateTime()} // Placeholder for current datetime
                    isInvalid={Boolean(errors.startDate)}
                    {...register("startDate", {
                        pattern: {
                            value: isodate_regex,
                            message: "Start Date must be in ISO format.",
                        },
                    })}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.startDate?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label htmlFor="endDate">End Date</Form.Label>
                <Form.Control
                    // Stryker disable next-line all
                    data-testid={`${testIdPrefix}-endDate`}
                    id="endDate"
                    type="datetime-local"
                    isInvalid={Boolean(errors.endDate)}
                    {...register("endDate", {
                        pattern: {
                            value: isodate_regex,
                            message: "End Date must be in ISO format.",
                        },
                    })}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label htmlFor="announcementText">Announcement</Form.Label>
                <Form.Control
                    as="textarea"
                    // Stryker disable next-line all
                    data-testid={`${testIdPrefix}-announcementText`}
                    id="announcementText"
                    rows={5}
                    isInvalid={Boolean(errors.announcementText)}
                    {...register("announcementText", {
                        required: "Announcement is required.",
                    })}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.announcementText?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Button
                type="submit"
                // Stryker disable next-line all
                data-testid={`${testIdPrefix}-submit`}
            >
                {buttonLabel}
            </Button>
            <Button
                variant="Secondary"
                onClick={() => navigate(-1)}
                // Stryker disable next-line all
                data-testid={`${testIdPrefix}-cancel`}
            >
                Cancel
            </Button>
        </Form>
    );
}

export default AnnouncementForm;
