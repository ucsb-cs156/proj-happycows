import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

function AnnouncementForm({ initialContents, submitAction, buttonLabel = "Create" }) {
    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Stryker disable all
    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm({
        defaultValues: {
            startDate: initialContents?.startDate 
                ? initialContents.startDate.split("T")[0]
                : getCurrentDate(),
            endDate: initialContents?.endDate,
            announcementText: initialContents?.announcementText || "",
            ...initialContents, 
        },
    });
    // Stryker restore all 

    const navigate = useNavigate();

    const testIdPrefix = "AnnouncementForm";

    const onSubmit = (data) => {
        if (!data.endDate) {
            data.endDate = null;
        }

        submitAction(data);
    };

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>

            {initialContents && (
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="id">Id</Form.Label>
                    <Form.Control
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
                    data-testid={testIdPrefix + "-startDate"}
                    id="startDate"
                    type="date" 
                    isInvalid={Boolean(errors.startDate)}
                    {...register("startDate", {
                        required: "Start Date is required.", 
                    })}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.startDate && 'Start Date is required.'}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label htmlFor="endDate">End Date</Form.Label>
                <Form.Control
                    data-testid={testIdPrefix + "-endDate"}
                    id="endDate"
                    type="date" 
                    isInvalid={Boolean(errors.endDate)}
                    {...register("endDate")}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label htmlFor="announcementText">Announcement</Form.Label>
                <Form.Control
                    as="textarea"
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
                data-testid={testIdPrefix + "-submit"}
            >
                {buttonLabel}
            </Button>
            <Button
                variant="Secondary"
                onClick={() => navigate(-1)}
                data-testid={testIdPrefix + "-cancel"}
            >
                Cancel
            </Button>

        </Form>
    );
}

export default AnnouncementForm;