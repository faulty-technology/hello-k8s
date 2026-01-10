module.exports = async ({ github, context, core }) => {
	const previewUrl = process.env.PREVIEW_URL;
	const namespace = process.env.NAMESPACE;
	const image = process.env.IMAGE;
	const status = process.env.STATUS || "deployed";
	const cpuLimit = process.env.CPU_LIMIT;
	const memoryLimit = process.env.MEMORY_LIMIT;

	let body;
	const resourcesLine = cpuLimit && memoryLimit
		? `- **Resources:** ${memoryLimit} memory, ${cpuLimit} CPU (limited)`
		: "";

	if (status === "deploying") {
		body = `## ⏳ Preview Environment Deploying...

Deploying preview to:
**${previewUrl}**

This comment will be updated when the deployment completes.

---
<details>
<summary>Preview Environment Details</summary>

- **Namespace:** ${namespace}
- **Image:** ${image}
${resourcesLine}

</details>`;
	} else {
		body = `## 🚀 Preview Environment Ready!

Your preview is deployed and available at:
**${previewUrl}**

This environment will be automatically deleted when the PR is closed.

---
<details>
<summary>Preview Environment Details</summary>

- **Namespace:** ${namespace}
- **Image:** ${image}
${resourcesLine}

</details>`;
	}

	// Find existing comment
	const { data: comments } = await github.rest.issues.listComments({
		owner: context.repo.owner,
		repo: context.repo.repo,
		issue_number: context.issue.number,
	});

	const botComment = comments.find(
		(comment) =>
			comment.user.type === "Bot" &&
			comment.body.includes("Preview Environment")
	);

	if (botComment) {
		await github.rest.issues.updateComment({
			owner: context.repo.owner,
			repo: context.repo.repo,
			comment_id: botComment.id,
			body,
		});
		core.info(`Updated existing comment ${botComment.id}`);
	} else {
		const { data: newComment } = await github.rest.issues.createComment({
			owner: context.repo.owner,
			repo: context.repo.repo,
			issue_number: context.issue.number,
			body,
		});
		core.info(`Created new comment ${newComment.id}`);
	}
};
