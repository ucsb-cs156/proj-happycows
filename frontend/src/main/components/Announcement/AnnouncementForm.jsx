import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useEffect, useMemo } from "react";
import {
  ANNOUNCEMENT_TEXT_MAX_LENGTH,
  isoDateTimeToDatetimeLocal,
} from "main/utils/announcementUtils";

function AnnouncementForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Convert ISO dates to datetime-local format for form input
  const convertedInitialContents = useMemo(
    () =>
      initialContents
        ? {
            ...initialContents,
            startDate: isoDateTimeToDatetimeLocal(initialContents.startDate),
            endDate: initialContents.endDate
              ? isoDateTimeToDatetimeLocal(initialContents.endDate)
              : undefined,
          }
        : {},
    [initialContents],
  );

  // Stryker disable all
  const {
    register,
    watch,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: convertedInitialContents || {} });
  // Stryker restore all

  // Update form values when initial data arrives
  useEffect(() => {
    if (initialContents) {
      reset(convertedInitialContents);
    }
  }, [initialContents, reset, convertedInitialContents]);

  const navigate = useNavigate();

  const testIdPrefix = "AnnouncementForm";
  const startDate = watch("startDate");
  const announcementText = watch("announcementText");
  const announcementTextMaxLengthMessage = `Announcement must be ${ANNOUNCEMENT_TEXT_MAX_LENGTH} characters or fewer.`;
  const atMaxAnnouncementLength =
    (announcementText?.length ?? 0) >= ANNOUNCEMENT_TEXT_MAX_LENGTH;
  const announcementTextInvalid =
    Boolean(errors.announcementText) || atMaxAnnouncementLength;

  // For explanation, see: https://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
  // Note that even this complex regex may still need some tweaks

  // Stryker disable next-line Regex
  const isodate_regex =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/i;

  // Stryker disable next-line all
  //const yyyyq_regex = /((19)|(20))\d{2}[1-4]/i; // Accepts from 1900-2099 followed by 1-4.  Close enough.

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      {initialContents && (
        <Form.Group className="mb-3">
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
            pattern: isodate_regex,
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.startDate &&
            "Start Date is required and must be provided in ISO format."}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="endDate">End Date</Form.Label>
        <Form.Control
          // Stryker disable next-line all
          data-testid={testIdPrefix + "-endDate"}
          id="endDate"
          type="datetime-local"
          isInvalid={Boolean(errors.endDate)}
          // Stryker disable next-line all
          {...register("endDate", {
            pattern: isodate_regex,
            validate: (value) =>
              !value ||
              !startDate ||
              value > startDate ||
              "End Date must be after Start Date.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.endDate?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="announcementText">Announcement</Form.Label>
        <Form.Control
          as="textarea"
          // Stryker disable next-line all
          data-testid={testIdPrefix + "-announcementText"}
          id="announcementText"
          rows={5}
          maxLength={ANNOUNCEMENT_TEXT_MAX_LENGTH}
          isInvalid={announcementTextInvalid}
          {...register("announcementText", {
            required: "Announcement is required.",
            maxLength: {
              value: ANNOUNCEMENT_TEXT_MAX_LENGTH,
              message: announcementTextMaxLengthMessage,
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.announcementText?.message ||
            (atMaxAnnouncementLength && announcementTextMaxLengthMessage)}
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
