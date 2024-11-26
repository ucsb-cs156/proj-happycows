import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

function AnnouncementForm({ initialContents, submitAction, buttonLabel = "Create" }) {

    const getDate = () => {
        const number = new Date();
        const year = number.getFullYear();
        const month = String(number.getMonth() + 1).padStart(2, '0');
        const day = String(number.getDate()).padStart(2, '0');
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
                : getDate(),
            endDate: initialContents?.endDate,
            announcementText: initialContents?.announcementText || "",
            ...initialContents, 
        },
    });
    // Stryker restore all

    const navigate = useNavigate();

    const testIdPrefix = "AnnouncementForm";

    // For explanation, see: https://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
    // Note that even this complex regex may still need some tweaks

    // Stryker disable next-line Regex
    const isodate_regex = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/i;

    // Stryker disable next-line all
    //const yyyyq_regex = /((19)|(20))\d{2}[1-4]/i; // Accepts from 1900-2099 followed by 1-4.  Close enough.

    const onSubmit = (data) => {
        if (!data.endDate) {
            data.endDate = null;
        }
        submitAction(data);
    };

    return (

        <Form onSubmit={handleSubmit(onSubmit)}>

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
                    type="date"
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