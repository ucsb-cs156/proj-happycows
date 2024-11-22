import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

function AnnouncementForm({ initialContents, submitAction, buttonLabel = "Create" }) {
    const navigate = useNavigate();
    const testIdPrefix = "AnnouncementForm";

    // Initialize React Hook Form
    const {
        register,
        formState: { errors },
        handleSubmit,
        watch,
    } = useForm({
        defaultValues: {
            startDate: initialContents?.startDate || new Date().toISOString(),
            endDate: initialContents?.endDate || "",
            announcementText: initialContents?.announcementText || "",
        },
    });

    // Watch form fields to ensure values are controlled
    const startDate = watch("startDate");
    const endDate = watch("endDate");

    const isodate_regex = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/i;

    const onSubmit = (data) => {
        const formattedData = {
            ...data,
            // Convert dates to include the timezone offset
            startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
            endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        };
        submitAction(formattedData);
    };

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            {initialContents && (
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="id">Id</Form.Label>
                    <Form.Control
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
                    Start Date <small>(defaults to current time)</small>
                </Form.Label>
                <Form.Control
                    data-testid={`${testIdPrefix}-startDate`}
                    id="startDate"
                    type="datetime-local"
                    isInvalid={Boolean(errors.startDate)}
                    {...register("startDate", {
                        pattern: {
                            value: isodate_regex,
                            message: "Start Date must be in ISO format.",
                        },
                    })}
                    defaultValue={startDate}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.startDate?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label htmlFor="endDate">End Date</Form.Label>
                <Form.Control
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
                    defaultValue={endDate}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.endDate?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label htmlFor="announcementText">Announcement</Form.Label>
                <Form.Control
                    as="textarea"
                    data-testid={`${testIdPrefix}-announcementText`}
                    id="announcementText"
                    rows={5}
                    isInvalid={Boolean(errors.announcementText)}
                    {...register("announcementText", {
                        required: "Announcement is required.",
                    })}
                    defaultValue={initialContents?.announcementText || ""}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.announcementText?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Button
                type="submit"
                data-testid={`${testIdPrefix}-submit`}
            >
                {buttonLabel}
            </Button>
            <Button
                variant="Secondary"
                onClick={() => navigate(-1)}
                data-testid={`${testIdPrefix}-cancel`}
            >
                Cancel
            </Button>
        </Form>
    );
}

export default AnnouncementForm;
