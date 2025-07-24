function Contact() {
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight">Contact Us</h2>
      <p className="text-gray-600 leading-relaxed mb-4">
        Reach out to us for any inquiries or feedback!
      </p>
      <div className="space-y-4">
        <p className="text-gray-600">Email: <a className="text-blue-600 hover:underline" href="mailto:example@mobileapp.com">example@mobileapp.com</a></p>
        <p className="text-gray-600">Phone: <a className="text-blue-600 hover:underline" href="tel:+1234567890">(123) 456-7890</a></p>
      </div>
    </div>
  );
}

export default Contact;