import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, User, MapPin, Package, Tag, CheckCircle } from 'lucide-react';
import Button from '../components/ui/button/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

type FormData = {
  // Step 1: Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Step 2: Address
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Step 3: Products
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  
  // Step 4: Payment
  paymentMethod: 'credit' | 'paypal' | 'bank';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  
  // Step 5: Review & Submit
  termsAccepted: boolean;
};

const productsList = [
  { id: 'prod-1', name: 'Ergonomic Keyboard', price: 129.99 },
  { id: 'prod-2', name: 'Wireless Mouse', price: 49.99 },
  { id: 'prod-3', name: 'Noise Cancelling Headphones', price: 199.99 },
  { id: 'prod-4', name: '4K Webcam', price: 149.99 },
];

const steps = [
  { id: '1', name: 'Personal Info', icon: User },
  { id: '2', name: 'Address', icon: MapPin },
  { id: '3', name: 'Products', icon: Package },
  { id: '4', name: 'Payment', icon: Tag },
  { id: '5', name: 'Review', icon: CheckCircle },
];

export default function MultiStepForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    products: [{ id: 'prod-1', name: 'Ergonomic Keyboard', quantity: 1, price: 129.99 }],
    paymentMethod: 'credit',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    termsAccepted: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProductChange = (id: string, field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(product => 
        product.id === id ? { ...product, [field]: value } : product
      )
    }));
  };

  const addProduct = (productId: string) => {
    const productToAdd = productsList.find(p => p.id === productId);
    if (productToAdd && !formData.products.some(p => p.id === productId)) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, { ...productToAdd, quantity: 1 }]
      }));
    }
  };

  const removeProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
  };

  const nextStep = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === steps.length - 1) {
      // Only submit on the last step
      console.log('Form submitted:', formData);
      // Here you would typically send the data to your API
      navigate('/success'); // Navigate to success page or show success message
    } else {
      // For other steps, just go to the next step
      nextStep();
    }
  };

  const totalAmount = formData.products.reduce(
    (sum, product) => sum + (product.price * product.quantity), 0
  );

  // Form validation
  const isStep1Valid = () => {
    return formData.firstName && formData.lastName && 
           /^\S+@\S+\.\S+$/.test(formData.email) && 
           formData.phone.length >= 10;
  };

  const isStep2Valid = () => {
    return formData.street && formData.city && 
           formData.state && formData.zipCode && 
           formData.country;
  };

  const isStep3Valid = () => {
    return formData.products.length > 0;
  };

  const isStep4Valid = () => {
    return (
      formData.paymentMethod &&
      (formData.paymentMethod !== 'credit' || 
       (formData.cardNumber.replace(/\s/g, '').length === 16 &&
        formData.expiryDate.match(/\d{2}\/\d{2}/) &&
        formData.cvv.length >= 3))
    );
  };

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 0: return isStep1Valid();
      case 1: return isStep2Valid();
      case 2: return isStep3Valid();
      case 3: return isStep4Valid();
      case 4: return formData.termsAccepted;
      default: return false;
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Step 1: Personal Info
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <p className="text-gray-600 dark:text-gray-400">Please provide your personal details.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="firstName">First Name *</label>
                <div className="mt-1">
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">Email *</label>
                <div className="mt-1">
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="phone">Phone *</label>
                <div className="mt-1">
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Step 2: Address
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Shipping Address</h2>
            <p className="text-gray-600 dark:text-gray-400">Where should we deliver your order?</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="street">Street Address *</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="state">State/Province *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="zipCode">ZIP/Postal Code *</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="country">Country *</label>
                  <Select
                    value={formData.country}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Step 3: Products
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Select Products</h2>
            <p className="text-gray-600 dark:text-gray-400">Choose the products you want to order.</p>
            
            <div className="space-y-4">
              {productsList.map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg border-gray-200 dark:border-gray-800">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">${product.price.toFixed(2)}</p>
                  </div>
                  {formData.products.some(p => p.id === product.id) ? (
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleProductChange(product.id, 'quantity', Math.max(1, (formData.products.find(p => p.id === product.id)?.quantity || 1) - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700"
                      >
                        -
                      </button>
                      <span>{formData.products.find(p => p.id === product.id)?.quantity || 0}</span>
                      <button
                        type="button"
                        onClick={() => handleProductChange(product.id, 'quantity', (formData.products.find(p => p.id === product.id)?.quantity || 0) + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addProduct(product.id)}
                      className="px-3 py-1.5 text-sm bg-brand-500 text-white rounded-md hover:bg-brand-600"
                    >
                      Add to Order
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {formData.products.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium mb-2">Order Summary</h3>
                {formData.products.map(product => (
                  <div key={product.id} className="flex justify-between py-1">
                    <span>{product.name} x{product.quantity}</span>
                    <span>${(product.price * product.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 font-medium">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3: // Step 4: Payment
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Payment Information</h2>
            <p className="text-gray-600 dark:text-gray-400">Enter your payment details.</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Payment Method</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'credit', label: 'Credit Card', icon: '💳' },
                    { id: 'paypal', label: 'PayPal', icon: '🔵' },
                    { id: 'bank', label: 'Bank Transfer', icon: '🏦' },
                  ].map(method => (
                    <label 
                      key={method.id}
                      className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer ${
                        formData.paymentMethod === method.id 
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="text-lg mr-2">{method.icon}</span>
                      <span>{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {formData.paymentMethod === 'credit' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="cardNumber">Card Number *</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2"
                      required={formData.paymentMethod === 'credit'}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="expiryDate">Expiry Date *</label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={(e) => {
                          // Format as MM/YY
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 2) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 4);
                          }
                          setFormData(prev => ({
                            ...prev,
                            expiryDate: value
                          }));
                        }}
                        placeholder="MM/YY"
                        className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2"
                        required={formData.paymentMethod === 'credit'}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="cvv">CVV *</label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={(e) => {
                          // Only allow numbers and limit to 4 digits
                          const value = e.target.value.replace(/\D/g, '').substring(0, 4);
                          setFormData(prev => ({
                            ...prev,
                            cvv: value
                          }));
                        }}
                        placeholder="123"
                        className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2"
                        required={formData.paymentMethod === 'credit'}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {formData.paymentMethod === 'paypal' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-blue-700 dark:text-blue-300">You will be redirected to PayPal to complete your payment.</p>
                </div>
              )}
              
              {formData.paymentMethod === 'bank' && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="font-medium mb-2">Bank Transfer Details</p>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p>Bank Name: Global Bank</p>
                    <p>Account Name: Example Corp</p>
                    <p>Account Number: 1234 5678 9012 3456</p>
                    <p>SWIFT/BIC: GLOBBANKXX</p>
                    <p className="mt-2 text-xs">Please include your order number as the payment reference.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4: // Step 5: Review & Submit
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-2xl font-semibold">Review Your Order</h2>
              <p className="text-gray-600 dark:text-gray-400">Please review your information before submitting.</p>
            </div>
            
            <div className="space-y-6">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium">Personal Information</h3>
                </div>
                <div className="p-4">
                  <p>{formData.firstName} {formData.lastName}</p>
                  <p className="text-gray-600 dark:text-gray-400">{formData.email}</p>
                  <p className="text-gray-600 dark:text-gray-400">{formData.phone}</p>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium">Shipping Address</h3>
                </div>
                <div className="p-4">
                  <p>{formData.street}</p>
                  <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                  <p>{formData.country}</p>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium">Order Summary</h3>
                </div>
                <div className="p-4">
                  {formData.products.map(product => (
                    <div key={product.id} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <span>{product.name} x{product.quantity}</span>
                      <span>${(product.price * product.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium">Payment Method</h3>
                </div>
                <div className="p-4">
                  {formData.paymentMethod === 'credit' && (
                    <div>
                      <p>Credit Card ending in {formData.cardNumber.slice(-4)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Expires {formData.expiryDate}</p>
                    </div>
                  )}
                  {formData.paymentMethod === 'paypal' && <p>PayPal</p>}
                  {formData.paymentMethod === 'bank' && <p>Bank Transfer</p>}
                </div>
              </div>
              
              <div className="mt-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                    required
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    I agree to the <a href="#" className="text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300">Terms and Conditions</a> and <a href="#" className="text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300">Privacy Policy</a>.
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-2xl font-semibold">Complete Your Order</CardTitle>
            <CardDescription>Fill in your details to complete your purchase</CardDescription>
            
            {/* Stepper */}
            <nav aria-label="Progress" className="mt-6">
              <ol className="flex items-center">
                {steps.map((step, index) => (
                  <li 
                    key={step.id} 
                    className={`${index !== steps.length - 1 ? 'flex-1' : ''} relative`}
                  >
                    {index < currentStep ? (
                      // Completed step
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30">
                          <Check className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                        </div>
                        <span className="mt-2 text-xs font-medium text-brand-600 dark:text-brand-400">{step.name}</span>
                      </div>
                    ) : index === currentStep ? (
                      // Current step
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-500">
                          <step.icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                        </div>
                        <span className="mt-2 text-xs font-medium text-brand-600 dark:text-brand-400">{step.name}</span>
                      </div>
                    ) : (
                      // Upcoming step
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700">
                          <step.icon className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">{step.name}</span>
                      </div>
                    )}
                    
                    {/* Connector line */}
                    {index < steps.length - 1 && (
                      <div className={`absolute top-5 left-1/2 -ml-px w-full h-0.5 ${index < currentStep ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {renderStepContent()}
                
                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className={`${currentStep === 0 ? 'invisible' : ''}`}>
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                    >
                      Back
                    </Button>
                  </div>
                  
                  {currentStep < steps.length - 1 ? (
                    <Button
                      variant="primary"
                      onClick={nextStep}
                      disabled={!isCurrentStepValid()}
                      endIcon={<ChevronRight className="h-4 w-4" />}
                      className="ml-auto"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={!isCurrentStepValid()}
                      className="ml-auto"
                    >
                      Submit Order
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
