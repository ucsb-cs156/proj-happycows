import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

export default function AdminCoursesIndexPage() {
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Index page not yet implemented</h1>
        <p>
          <a href="/admin/createcourses">Create</a>
        </p>
        <p>
          <a href="/admin/editcourses/1">Edit</a>
        </p>
      </div>
    </BasicLayout>
  );
}
