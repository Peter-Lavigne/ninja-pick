class Ninja < ApplicationRecord
  belongs_to :event
  has_many :picks, dependent: :destroy

  validates :sex, inclusion: { in: ['male', 'female'] }
  validates :name, uniqueness: { scope: [:sex, :event],
    message: "should have unique ninja names per event" }
end
