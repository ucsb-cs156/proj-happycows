// vitest.setup.jsx
import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";

const actualReactBootstrapPromise = vi.importActual("react-bootstrap");


vi.mock("react-bootstrap", async () => {
	const actual = await actualReactBootstrapPromise;

	const Modal = ({ show, children, onHide = () => {}, ...rest }) => {
		React.useEffect(() => {
			if (show) {
				document.body.classList.add("modal-open");
			} else {
				document.body.classList.remove("modal-open");
			}
			return () => {
				document.body.classList.remove("modal-open");
			};
		}, [show]);

		React.useEffect(() => {
			if (!show) {
				return undefined;
			}

			const handleKeyDown = (event) => {
				if (event.key === "Escape") {
					onHide();
				}
			};

			window.addEventListener("keydown", handleKeyDown);
			return () => {
				window.removeEventListener("keydown", handleKeyDown);
			};
		}, [show, onHide]);

		const keepMounted = rest["data-testid"] === "CommonsTable-Modal";
		if (!show && !keepMounted) {
			return null;
		}

		const hiddenProps = !show && keepMounted
			? { hidden: true, style: { display: "none" } }
			: {};

		return (
			<div
				aria-hidden={!show}
				data-show={show ? "true" : "false"}
				{...hiddenProps}
				{...rest}
			>
				{React.Children.map(children, (child) => {
					if (!React.isValidElement(child)) {
						return child;
					}
					if (child.type === Header) {
						return React.cloneElement(child, { onHide });
					}
					return child;
				})}
			</div>
		);
	};

	const Header = ({ closeButton, onHide = () => {}, children, ...props }) => (
		<div {...props}>
			{children}
			{closeButton ? (
				<button
					type="button"
					aria-label="Close"
					onClick={onHide}
					data-testid="Modal-close-button"
				>
					x
				</button>
			) : null}
		</div>
	);

	const Body = ({ children, ...props }) => <div {...props}>{children}</div>;
	const Footer = ({ children, ...props }) => <div {...props}>{children}</div>;
	const Title = ({ children, ...props }) => <h2 {...props}>{children}</h2>;

	Modal.Header = Header;
	Modal.Body = Body;
	Modal.Footer = Footer;
	Modal.Title = Title;

	return {
		...actual,
		Modal,
	};
});
