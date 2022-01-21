class AddSexToNinjas < ActiveRecord::Migration[7.0]
  def change
    add_column :ninjas, :sex, :string
  end
end
