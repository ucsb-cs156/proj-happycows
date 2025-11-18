// vitest.setup.js
import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";

const actualReactBootstrapPromise = vi.importActual("react-bootstrap");

vi.mock("react-bootstrap", async () => {
	const actual = await actualReactBootstrapPromise;

	const Modal = ({ show, children, onHide = () => {}, ...rest }) => {
		if (!show) {
			return null;
		}

		return (
			<div {...rest}>
				{React.Children.map(children, (child) => {
					if (!React.isValidElement(child)) {
						return child;
					}
					return React.cloneElement(child, { onHide });
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
					×
				</button>
			) : null}
		</div>
	);

	const Body = ({ children, ...props }) => <div {...props}>{children}</div>;
	const Footer = ({ children, ...props }) => <div {...props}>{children}</div>;

	Modal.Header = Header;
	Modal.Body = Body;
	Modal.Footer = Footer;

	return {
		...actual,
		Modal,
	};
});
