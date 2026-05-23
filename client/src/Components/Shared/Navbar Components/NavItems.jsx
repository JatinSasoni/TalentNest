/* eslint-disable react/prop-types */
import { NavLink } from "react-router-dom";

export const NavItems = ({ loggedInUser }) => {
  return (
    <nav className="hidden lg:grid place-items-center">
      <ul
        className={`${
          !loggedInUser && "xl:ml-20"
        } flex gap-3 md:gap-9 [&>*]:text-xs  md:[&>*]:text-lg  [&>*]:text-gray-600 dark:[&>li]:text-gray-400  `}
      >
        {loggedInUser?.role === "recruiter" ? (
          <>
            <li>
              <NavLink to="/admin/companies">Companies</NavLink>
            </li>
            <li>
              <NavLink to="/admin/jobs">Jobs</NavLink>
            </li>
            {loggedInUser?.subscription?.status !== "active" && (
              <li>
                <NavLink to="/admin/subscribe">Subscribe</NavLink>
              </li>
            )}

            <li>
              <NavLink to="/contact">Contact Us</NavLink>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/">Home</NavLink>
            </li>
            <li>
              <NavLink to="/contact">Contact us</NavLink>
            </li>
            <li>
              <NavLink to="/jobs">Jobs</NavLink>
            </li>
            <li>
              <NavLink to="/browse">Browse</NavLink>
            </li>
            {loggedInUser?.role === "student" && (
              <>
                <li>
                  <NavLink to="/resume-review">AI Resume</NavLink>
                </li>
                <li>
                  <NavLink to="/resume-builder">Resume Builder</NavLink>
                </li>
              </>
            )}
          </>
        )}
      </ul>
    </nav>
  );
};
