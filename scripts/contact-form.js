(() => {
	const form = document.getElementById('contact-form');
	if (!form) {
		return;
	}

	const endpoint = '/.netlify/functions/send-contact';
	const feedback = document.getElementById('contact-feedback');
	const errorElements = Array.from(document.querySelectorAll('.field-error'));

	const setFeedback = (message, variant = '') => {
		if (!feedback) {
			return;
		}
		feedback.textContent = message;
		feedback.classList.remove('success', 'error', 'loading');
		if (variant) {
			feedback.classList.add(variant);
		}
	};

	const clearErrors = () => {
		errorElements.forEach((el) => {
			el.textContent = '';
		});
	};

	const displayFieldErrors = (errors = {}) => {
		Object.entries(errors).forEach(([field, message]) => {
			const errorElement = document.querySelector(`[data-error-for="${field}"]`);
			if (errorElement) {
				errorElement.textContent = message;
			}
		});
	};

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		clearErrors();
		setFeedback('Envoi en cours…', 'loading');

		const formData = new FormData(form);
		const payload = {
			name: formData.get('name'),
			email: formData.get('email'),
			message: formData.get('message'),
			honeypot: formData.get('honeypot'),
		};

		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			const body = await response.json().catch(() => ({}));

			if (!response.ok) {
				if (body.errors) {
					displayFieldErrors(body.errors);
				}
				const message = body.message || "Impossible d'envoyer votre message pour le moment.";
				setFeedback(message, 'error');
				return;
			}

			form.reset();
			setFeedback(body.message || 'Merci ! Votre message a bien été envoyé.', 'success');
		} catch (error) {
			console.error('Contact form submission failed', error);
			setFeedback("Une erreur inattendue est survenue. Merci de réessayer plus tard.", 'error');
		}
	});
})();

