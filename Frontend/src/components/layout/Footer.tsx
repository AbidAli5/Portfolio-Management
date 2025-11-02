export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Portfolio Management System. All rights reserved.</p>
          <p>Version 1.0.0</p>
        </div>
      </div>
    </footer>
  );
}
