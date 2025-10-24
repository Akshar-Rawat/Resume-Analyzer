import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePuterStore } from "../store/puter";

const WipeApp = () => {
  const { auth, isLoading, error, fs, kv, init } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [deleting, setDeleting] = useState(false);

  const loadFiles = async () => {
    try {
      const files = await fs.readDir("./");
      setFiles(files || []);
    } catch (err) {
      console.error("Error loading files:", err);
    }
  };

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    loadFiles();
  }, [fs]);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete all ${files.length} files and KV data?`)) {
      return;
    }

    try {
      setDeleting(true);
      await Promise.all(files.map((file) => fs.delete(file.path)));
      await kv.flush();
      alert("✅ All data wiped!");
      await loadFiles();
    } catch (err) {
      console.error("Error:", err);
      alert("Error: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Wipe App Data</h1>
        <p className="text-gray-600">
          Authenticated as: <strong>{auth.user?.username}</strong>
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">
          Existing files: ({files.length})
        </h2>
        
        {files.length > 0 ? (
          <div className="flex flex-col gap-2">
            {files.map((file, index) => (
              <div
                key={file.id || index}
                className="p-3 bg-gray-100 rounded border border-gray-300"
              >
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-600">{file.path}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No files found</p>
        )}
      </div>

      <div className="p-4 bg-red-50 border border-red-300 rounded">
        <h3 className="text-lg font-bold text-red-700 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-700 mb-4">
          This will permanently delete all files and data.
        </p>
        <button
          onClick={handleDelete}
          disabled={files.length === 0 || deleting}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {deleting ? "Deleting..." : `Wipe All Data (${files.length} files)`}
        </button>
      </div>

      {files.length === 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-300 rounded text-center">
          <p className="text-green-700 font-semibold">✅ Storage is empty!</p>
        </div>
      )}
    </div>
  );
};

export default WipeApp;