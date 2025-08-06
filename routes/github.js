const express = require('express');
const { Octokit } = require('octokit');
const Joi = require('joi');

const router = express.Router();

// Helper function to get Octokit instance with user token
const getOctokit = (token) => {
  return new Octokit({
    auth: token,
    request: {
      fetch: require('node-fetch')
    }
  });
};

// Validation schemas
const repositorySchema = Joi.object({
  owner: Joi.string().required(),
  repo: Joi.string().required()
});

const filePathSchema = Joi.object({
  owner: Joi.string().required(),
  repo: Joi.string().required(),
  path: Joi.string().default('')
});

const prSchema = Joi.object({
  owner: Joi.string().required(),
  repo: Joi.string().required(),
  branch: Joi.string().required(),
  title: Joi.string().required(),
  body: Joi.string().required(),
  files: Joi.array().items(Joi.object({
    path: Joi.string().required(),
    content: Joi.string().required()
  })).required()
});

// Get user repositories
router.get('/repositories', async (req, res) => {
  try {
    const octokit = getOctokit(req.githubToken);
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100
    });

    const formattedRepos = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: repo.owner.login,
      description: repo.description,
      language: repo.language,
      updated_at: repo.updated_at,
      private: repo.private,
      html_url: repo.html_url
    }));

    res.json({ success: true, repositories: formattedRepos });
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch repositories',
      message: error.message 
    });
  }
});

// Get repository files
router.get('/files/:owner/:repo', async (req, res) => {
  try {
    const { error, value } = repositorySchema.validate({
      owner: req.params.owner,
      repo: req.params.repo
    });

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid parameters',
        details: error.details 
      });
    }

    const { owner, repo } = value;
    const path = req.query.path || '';

    const octokit = getOctokit(req.githubToken);
    const { data: contents } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path
    });

    // Filter for code files only
    const codeExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', 
      '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.clj',
      '.html', '.css', '.scss', '.sass', '.vue', '.svelte'
    ];

    const files = Array.isArray(contents) 
      ? contents.filter(item => {
          if (item.type === 'file') {
            const extension = item.name.substring(item.name.lastIndexOf('.'));
            return codeExtensions.includes(extension.toLowerCase());
          }
          return item.type === 'dir';
        })
      : [contents];

    const formattedFiles = files.map(file => ({
      name: file.name,
      path: file.path,
      type: file.type,
      size: file.size,
      sha: file.sha,
      url: file.html_url,
      download_url: file.download_url
    }));

    res.json({ 
      success: true, 
      files: formattedFiles,
      path: path || '/'
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch files',
      message: error.message 
    });
  }
});

// Get file content
router.get('/file/:owner/:repo', async (req, res) => {
  try {
    const { error, value } = repositorySchema.validate({
      owner: req.params.owner,
      repo: req.params.repo
    });

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid parameters',
        details: error.details 
      });
    }

    const { owner, repo } = value;
    const { path } = req.query;

    if (!path) {
      return res.status(400).json({ 
        success: false, 
        error: 'File path is required' 
      });
    }

    const octokit = getOctokit(req.githubToken);
    const { data: file } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path
    });

    // Decode content if it's base64 encoded
    let content = file.content;
    if (file.encoding === 'base64') {
      content = Buffer.from(file.content, 'base64').toString('utf-8');
    }

    res.json({
      success: true,
      file: {
        name: file.name,
        path: file.path,
        content: content,
        size: file.size,
        sha: file.sha,
        encoding: file.encoding
      }
    });
  } catch (error) {
    console.error('Error fetching file content:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch file content',
      message: error.message 
    });
  }
});

// Create pull request with test cases
router.post('/create-pr', async (req, res) => {
  try {
    const { error, value } = prSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid parameters',
        details: error.details 
      });
    }

    const { owner, repo, branch, title, body, files } = value;

    const octokit = getOctokit(req.githubToken);
    
    // Create a new branch
    const timestamp = Date.now();
    const newBranch = `test-cases-${timestamp}`;

    // Get the latest commit SHA
    const { data: ref } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    });

    // Create new branch
    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${newBranch}`,
      sha: ref.object.sha
    });

    // Add files to the new branch
    for (const file of files) {
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: file.path,
        message: `Add test case: ${file.path}`,
        content: Buffer.from(file.content).toString('base64'),
        branch: newBranch
      });
    }

    // Create pull request
    const { data: pr } = await octokit.rest.pulls.create({
      owner,
      repo,
      title,
      body,
      head: newBranch,
      base: branch
    });

    res.json({
      success: true,
      pull_request: {
        id: pr.id,
        number: pr.number,
        title: pr.title,
        html_url: pr.html_url,
        state: pr.state,
        created_at: pr.created_at
      }
    });
  } catch (error) {
    console.error('Error creating pull request:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create pull request',
      message: error.message 
    });
  }
});

module.exports = router; 