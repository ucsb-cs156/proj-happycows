import React, { useState } from "react";
import {
  Button,
  Col,
  Form,
  OverlayTrigger,
  Row,
  Table,
  Tooltip,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import OurTable from "main/components/OurTable";
import PageSizeSelector from "main/components/Utils/PageSizeSelector";
import { useBackendMutation } from "main/utils/useBackend";
import usePageSize from "main/utils/usePageSize";

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200, 500];
const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_STORAGE_KEY = "participation-grade-page-size";

const DEFAULT_VALUES = {
  startDate: "",
  endDate: "",
  criterion1Weight: 40,
  criterion2Weight: 40,
  criterion2MinDays: 5,
  criterion2PartialCredit: false,
  criterion3Weight: 20,
  totalPoints: 100,
};

// "n can be specified up to the number of days in the period" (issue #292).
// Both endpoints are inclusive, e.g. Jan 1 - Jan 5 is 5 days. An empty
// startDate/endDate needs no explicit guard: it makes one of the Date
// objects below Invalid, which propagates to a NaN diffDays and so already
// falls through to the null branch of the final ternary.
function daysInPeriod(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays + 1 : null;
}

const columns = [
  { Header: "Perm", accessor: "perm" },
  { Header: "Last Name", accessor: "lastName" },
  { Header: "First/Middle Name", accessor: "firstMiddleName" },
  {
    Header: "Interacted",
    accessor: "interactedAtLeastOnce",
    Cell: ({ value }) => (value ? "Yes" : "No"),
  },
  { Header: "Days Interacted", accessor: "daysInteracted" },
  {
    Header: "Owned & Checked In On a Cow",
    accessor: "ownedAndCheckedInOnACow",
    Cell: ({ value }) => (value ? "Yes" : "No"),
  },
  { Header: "Points Earned", accessor: "totalPointsEarned" },
];

// The Participation Grade tab of a course's admin page: computing grades
// and downloading them as a CSV, scoped to this courseId. See issue #292.
export default function ParticipationGradeTabComponent({
  courseId,
  testid = "ParticipationGradeTabComponent",
}) {
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  const [grades, setGrades] = useState(null);
  const [downloadParams, setDownloadParams] = useState(null);

  const [pageSize, handlePageSizeChange] = usePageSize({
    storageKey: PAGE_SIZE_STORAGE_KEY,
    options: PAGE_SIZE_OPTIONS,
    defaultPageSize: DEFAULT_PAGE_SIZE,
  });

  const criterion1Weight = watch("criterion1Weight");
  const criterion2Weight = watch("criterion2Weight");
  const criterion3Weight = watch("criterion3Weight");
  const totalWeight =
    Number(criterion1Weight || 0) +
    Number(criterion2Weight || 0) +
    Number(criterion3Weight || 0);

  // No explicit method: axios defaults to GET, and this keeps the source
  // free of a "GET" string literal whose value axios ignores anyway (it
  // falls back to GET for any falsy method), which would otherwise be an
  // unkillable mutation-testing survivor.
  const objectToAxiosParamsCompute = (data) => ({
    url: "/api/participationgrade/compute",
    params: { courseId, ...data },
  });

  const computeMutation = useBackendMutation(objectToAxiosParamsCompute, {
    onSuccess: (data) => {
      setGrades(data);
      toast(`Computed grades for ${data.length} student(s).`);
    },
  });

  const onSubmit = (data) => {
    setDownloadParams(data);
    computeMutation.mutate(data);
  };

  const downloadUrl = downloadParams
    ? `/api/participationgrade/download?${new URLSearchParams({ courseId, ...downloadParams }).toString()}`
    : null;

  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const period = daysInPeriod(startDate, endDate);

  return (
    <div data-testid={testid}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="startDate">Start Date</Form.Label>
              <Form.Control
                id="startDate"
                type="date"
                data-testid={`${testid}-startDate`}
                isInvalid={!!errors.startDate}
                {...register("startDate", {
                  required: "Start date is required",
                })}
              />
              <Form.Control.Feedback type="invalid">
                {errors.startDate?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="endDate">End Date</Form.Label>
              <Form.Control
                id="endDate"
                type="date"
                data-testid={`${testid}-endDate`}
                isInvalid={!!errors.endDate}
                {...register("endDate", {
                  required: "End date is required",
                  validate: {
                    isAfterStartDate: (v) =>
                      v >= getValues("startDate") ||
                      "End date must not be before start date",
                  },
                })}
              />
              <Form.Control.Feedback type="invalid">
                {errors.endDate?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="totalPoints">
                Activity Worth (points)
              </Form.Label>
              <Form.Control
                id="totalPoints"
                type="number"
                step="0.01"
                data-testid={`${testid}-totalPoints`}
                isInvalid={!!errors.totalPoints}
                {...register("totalPoints", {
                  valueAsNumber: true,
                  required: "Total points is required",
                  min: { value: 0.01, message: "Total points must be > 0" },
                })}
              />
              <Form.Control.Feedback type="invalid">
                {errors.totalPoints?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <h5>Grade Items</h5>
        <p>
          These need to add up to 100%. Use 0% for any items you want to
          exclude.
        </p>

        <Table bordered responsive data-testid={`${testid}-gradeItemsTable`}>
          <thead>
            <tr>
              <th>Weight</th>
              <th>Item Explanation</th>
              <th>Adjustments</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Form.Control
                  id="criterion1Weight"
                  type="number"
                  aria-label="Interacted at least once (% weight)"
                  data-testid={`${testid}-criterion1Weight`}
                  isInvalid={!!errors.criterion1Weight}
                  {...register("criterion1Weight", {
                    valueAsNumber: true,
                    required: true,
                    min: { value: 0, message: "Weight must be 0-100" },
                    max: { value: 100, message: "Weight must be 0-100" },
                  })}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.criterion1Weight?.message}
                </Form.Control.Feedback>
              </td>
              <td>Interacted at least once</td>
              <td></td>
            </tr>
            <tr>
              <td>
                <Form.Control
                  id="criterion3Weight"
                  type="number"
                  aria-label="Owned & checked in on a living cow (% weight)"
                  data-testid={`${testid}-criterion3Weight`}
                  isInvalid={!!errors.criterion3Weight}
                  {...register("criterion3Weight", {
                    valueAsNumber: true,
                    required: true,
                    min: { value: 0, message: "Weight must be 0-100" },
                    max: { value: 100, message: "Weight must be 0-100" },
                    validate: {
                      sumsTo100: (v) => {
                        const sum =
                          Number(getValues("criterion1Weight") || 0) +
                          Number(getValues("criterion2Weight") || 0) +
                          Number(v || 0);
                        return (
                          sum === 100 ||
                          "The three weights must sum to 100 (currently " +
                            sum +
                            ")"
                        );
                      },
                    },
                  })}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.criterion3Weight?.message}
                </Form.Control.Feedback>
              </td>
              <td>Owned &amp; checked in on a living cow</td>
              <td></td>
            </tr>
            <tr>
              <td>
                <Form.Control
                  id="criterion2Weight"
                  type="number"
                  aria-label="Interacted on at least n days (% weight)"
                  data-testid={`${testid}-criterion2Weight`}
                  isInvalid={!!errors.criterion2Weight}
                  {...register("criterion2Weight", {
                    valueAsNumber: true,
                    required: true,
                    min: { value: 0, message: "Weight must be 0-100" },
                    max: { value: 100, message: "Weight must be 0-100" },
                  })}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.criterion2Weight?.message}
                </Form.Control.Feedback>
              </td>
              <td>Interacted on at least n days</td>
              <td>
                <div className="mb-2">
                  <Form.Label htmlFor="criterion2MinDays" className="me-2">
                    n days required
                  </Form.Label>
                  <Form.Control
                    id="criterion2MinDays"
                    type="number"
                    className="d-inline-block w-auto"
                    data-testid={`${testid}-criterion2MinDays`}
                    isInvalid={!!errors.criterion2MinDays}
                    {...register("criterion2MinDays", {
                      valueAsNumber: true,
                      required: true,
                      validate: {
                        inRange: (v) => {
                          if (Number(getValues("criterion2Weight")) === 0) {
                            return true;
                          }
                          const max = daysInPeriod(
                            getValues("startDate"),
                            getValues("endDate"),
                          );
                          if (max === null) {
                            return true;
                          }
                          return (
                            (v >= 1 && v <= max) ||
                            `n must be between 1 and ${max} (the number of days in the period)`
                          );
                        },
                      },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.criterion2MinDays?.message}
                  </Form.Control.Feedback>
                </div>
                <div>
                  <Form.Label
                    htmlFor="criterion2PartialCredit"
                    className="me-2"
                  >
                    Partial credit:
                  </Form.Label>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip>
                        Assign pro-rated partial credit if student participated
                        on at least one day, fewer than n days
                      </Tooltip>
                    }
                  >
                    <Form.Check
                      type="switch"
                      id="criterion2PartialCredit"
                      className="d-inline-block"
                      data-testid={`${testid}-criterion2PartialCredit`}
                      {...register("criterion2PartialCredit")}
                    />
                  </OverlayTrigger>
                </div>
              </td>
            </tr>
            <tr>
              <td data-testid={`${testid}-totalWeight`}>{totalWeight}%</td>
              <td>Total Percentage (should be 100%)</td>
              <td></td>
            </tr>
          </tbody>
        </Table>

        {period !== null && (
          <p data-testid={`${testid}-daysInPeriod`}>
            {period} day(s) in the selected period.
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          className="mb-3 me-2"
          data-testid={`${testid}-preview-button`}
          disabled={computeMutation.isLoading}
        >
          Preview Grades
        </Button>
        {downloadUrl && (
          <Button
            href={downloadUrl}
            variant="success"
            className="mb-3"
            data-testid={`${testid}-download-button`}
          >
            Download CSV
          </Button>
        )}
      </Form>

      {grades && (
        <>
          <PageSizeSelector
            value={pageSize}
            onChange={handlePageSizeChange}
            options={PAGE_SIZE_OPTIONS}
            testid={`${testid}-table-page-size-selector`}
          />
          <OurTable
            data={grades}
            columns={columns}
            testid={`${testid}-table`}
            pageSize={pageSize}
          />
        </>
      )}
    </div>
  );
}
