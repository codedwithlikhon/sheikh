import React, { useState } from 'react'
import { File, Folder, FolderOpen, Trash2, FileText } from 'lucide-react'

const FileExplorer = ({ files, activeFile, onSelectFile, onDeleteFile }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  const toggleFolder = (folderName) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName)
    } else {
      newExpanded.add(folderName)
    }
    setExpandedFolders(newExpanded)
  }

  const handleDeleteClick = (e, filePath) => {
    e.stopPropagation()
    setShowDeleteConfirm(filePath)
  }

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      onDeleteFile(showDeleteConfirm)
      setShowDeleteConfirm(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(null)
  }

  const getFileIcon = (file) => {
    if (file.type === 'directory') {
      return expandedFolders.has(file.name) ? <FolderOpen size={16} /> : <Folder size={16} />
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase()
    return <FileText size={16} />
  }

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    const typeMap = {
      'js': 'JavaScript',
      'jsx': 'React',
      'ts': 'TypeScript',
      'tsx': 'React TS',
      'py': 'Python',
      'html': 'HTML',
      'css': 'CSS',
      'json': 'JSON',
      'md': 'Markdown',
      'txt': 'Text'
    }
    return typeMap[extension] || 'File'
  }

  const renderFileItem = (file, depth = 0) => {
    const isActive = activeFile === file.path
    const isExpanded = expandedFolders.has(file.name)
    
    return (
      <div key={file.path}>
        <div
          className={`file-item ${isActive ? 'active' : ''}`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => {
            if (file.type === 'directory') {
              toggleFolder(file.name)
            } else {
              onSelectFile(file.path)
            }
          }}
        >
          <div className="flex items-center gap-2 flex-1">
            {getFileIcon(file)}
            <span className="flex-1 truncate">{file.name}</span>
            <span className="text-xs text-code-border">
              {file.type === 'directory' ? '' : getFileType(file.name)}
            </span>
          </div>
          
          {file.type === 'file' && (
            <button
              onClick={(e) => handleDeleteClick(e, file.path)}
              className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        
        {/* Render children if it's an expanded directory */}
        {file.type === 'directory' && isExpanded && file.children && (
          <div>
            {file.children.map(child => renderFileItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  // Group files by directory structure
  const organizeFiles = (files) => {
    const fileTree = []
    const folderMap = new Map()
    
    files.forEach(file => {
      const pathParts = file.path.split('/')
      const fileName = pathParts.pop()
      const folderPath = pathParts.join('/')
      
      if (pathParts.length === 0) {
        // Root level file
        fileTree.push({ ...file, name: fileName })
      } else {
        // File in a folder
        if (!folderMap.has(folderPath)) {
          const folderName = pathParts[0]
          const folderFile = {
            name: folderName,
            path: folderPath,
            type: 'directory',
            children: []
          }
          folderMap.set(folderPath, folderFile)
          fileTree.push(folderFile)
        }
        
        const folder = folderMap.get(folderPath)
        folder.children.push({ ...file, name: fileName })
      }
    })
    
    return fileTree
  }

  const organizedFiles = organizeFiles(files)

  return (
    <div className="flex-1 overflow-y-auto">
      {organizedFiles.length === 0 ? (
        <div className="p-4 text-center text-code-border">
          <FileText size={32} className="mx-auto mb-2" />
          <p className="text-sm">No files found</p>
        </div>
      ) : (
        <div>
          {organizedFiles.map(file => renderFileItem(file))}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-code-sidebar p-6 rounded-lg border border-code-border max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Delete File</h3>
            <p className="text-code-text mb-6">
              Are you sure you want to delete <code className="bg-code-bg px-2 py-1 rounded">{showDeleteConfirm}</code>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="button-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileExplorer
